import swaggerUi from 'swagger-ui-express';
import swaggerAutogen from 'swagger-autogen';
import { createRequire } from "module";
import dotenv from "dotenv";

const require = createRequire(import.meta.url);
const swaggerFile = require('./output.json');
const swaggerFilePath = require.resolve('./output.json');

dotenv.config();

const options = {
    info: {
        title: 'Documenter',
        description: "API endpoints for Documenter",
        version: '1.0.0',
    },
    host: `localhost:${process.env.PORT}`,
    basePath: "/",
    apis: ['./router/*.js'],
};

// Auto-generate swagger documentation file
// const outputFilePath = './swagger-output.json';
const routes = ['../server.js'];
swaggerAutogen()(swaggerFilePath, routes, options);

// Serve Swagger Docs
function swaggerDocs(app, port) {
    // Serve Swagger Page
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
    // Documentation in JSON format
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerFile)
    })
    console.log(`Swagger docs available at http://localhost:${port}/docs`)
}


export default swaggerDocs