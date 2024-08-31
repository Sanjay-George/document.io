import swaggerUi from 'swagger-ui-express';
import swaggerAutogen from 'swagger-autogen';
import dotenv from "dotenv";
import * as swaggerFile from './output.json';

dotenv.config();

const swaggerFilePath = require.resolve('./output.json');

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
const routes = ['./server.ts']; // Entry file for the project
swaggerAutogen()(swaggerFilePath, routes, options);

// Serve Swagger Docs
export default function serveDocs(app, port) {
    // Serve Swagger Page
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
    // Documentation in JSON format
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerFile)
    })
    console.log(`Swagger docs available at http://localhost:${port}/docs`)
}


