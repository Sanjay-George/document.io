import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRouter from "./libs/controllers/projects";
import documentRouter from "./libs/controllers/documentations";
import pageRouter from "./libs/controllers/pages";
import annotationRouter from "./libs/controllers/annotations";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/projects', projectRouter);
app.use('/documentations', documentRouter);
app.use('/pages', pageRouter);
app.use('/annotations', annotationRouter);


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