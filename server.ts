import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRouter from "./libs/controllers/projects";
import documentRouter from "./libs/controllers/documentations";
import pageRouter from "./libs/controllers/pages";
import annotationRouter from "./libs/controllers/annotations";
import originRouter from "./libs/controllers/origins";
import Origin from "./libs/database/origin";
import { createProxyMiddleware } from 'http-proxy-middleware';
import zlib, { InputType } from 'zlib';

dotenv.config();
const originDB = new Origin();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        originDB.getAll().then((whitelistedOrigins) => {
            if (whitelistedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        });
    }
}


app.use(cors(corsOptions));
// Routes
app.use('/projects', projectRouter);
app.use('/documentations', documentRouter);
app.use('/pages', pageRouter);
app.use('/annotations', annotationRouter);
app.use('/origins', originRouter);

// Function to rewrite URLs in the HTML content
function rewriteUrls(html, proxyPath) {
    return html.replace(/(href|src)="([^"]+)"/g, (match, attr, url) => {
        // Skip rewriting for external URLs or anchor links
        if (url.startsWith('http') || url.startsWith('#') || url.startsWith('//')) {
            return match;
        }

        // Rewrite relative URLs to go through the proxy
        const proxiedUrl = `${proxyPath}?url=${encodeURIComponent(url)}`;
        return `${attr}="${proxiedUrl}"`;
    });
}


// proxy
// Using stackoverflow.com as a test target. To be removed soon.
// TODO: check this code. Only partially working
app.use('/proxy', createProxyMiddleware({
    target: '',
    changeOrigin: true,
    selfHandleResponse: true,
    // @ts-ignore
    router: (req) => req.query.url || '', // Dynamically route requests
    on: {
        proxyRes: (proxyRes, req, res) => {
            // @ts-ignore
            // const targetUrl = req.query.url || '';

            let body = [];

            // Collect response data from the proxied server
            proxyRes.on('data', (chunk) => {
                body.push(chunk);
            });

            // When the response has finished
            proxyRes.on('end', () => {
                body = Buffer.concat(body) as any;

                // Decompress if gzipped
                if (proxyRes.headers['content-encoding'] === 'gzip') {
                    body = zlib.gunzipSync(body as any as InputType) as any;  // Uff TypeScript
                }
                else if (proxyRes.headers['content-encoding'] === 'deflate') {
                    body = zlib.inflateSync(body as any as InputType) as any;
                }
                else if (proxyRes.headers['content-encoding'] === 'br') {
                    body = zlib.brotliDecompressSync(body as any as InputType) as any;
                }

                // Handle HTML content proxying
                let contentType = proxyRes.headers['content-type'];
                if (contentType && contentType.includes('text/html')) {
                    let html = body.toString();
                    html = rewriteUrls(html, '/proxy');
                    body = Buffer.from(html, 'utf-8') as any;
                }

                // Remove restrictive CSP & encoding headers
                delete proxyRes.headers['content-security-policy'];
                delete proxyRes.headers['x-frame-options'];
                delete proxyRes.headers['content-encoding'];

                // Set headers for the response
                res.writeHead(proxyRes.statusCode, {
                    ...proxyRes.headers,
                    'Content-Length': body.length,
                });
                res.end(body); // Send the decompressed body
            });

        }

    }
}));


app.listen(port, async () => {
    console.log(`Node server listening on port: ${port}`);

    // Serve Swagger Docs
    if (process.env.NODE_ENV === 'development') {
        const swaggerDocs = await import('./swagger/swagger');
        swaggerDocs.default(app, port);
    }
});


// handle unhandled promise rejections
process.on('unhandledRejection', async (err: any) => {
    console.error('Unhandled Rejection', err);
});

// handle uncaught exceptionss
process.on('uncaughtException', async (err: any) => {
    console.error('Uncaught Exception', err);
});