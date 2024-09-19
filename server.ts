import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRouter from "./libs/controllers/projects";
import documentRouter from "./libs/controllers/documentations";
import pageRouter from "./libs/controllers/pages";
import annotationRouter from "./libs/controllers/annotations";
import originRouter from "./libs/controllers/origins";
import Origin from "./libs/database/origin";

dotenv.config();
const originDB = new Origin();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
const corsOptions = {
    origin: function (origin, callback) {
        console.log('origin', origin);
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log('allowed origin', origin);
            return callback(null, true);
        }
        originDB.getAll().then((whitelistedOrigins) => {
            if (whitelistedOrigins.includes(origin)) {
                console.log('allowed origin', origin);
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