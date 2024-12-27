import express from 'express';
import DocumentationDB from '../database/documentation';
import AnnotationDB from '../database/annotation';
import { Documentation } from '../models/documentation';
import { whitelistOrigin } from './documentations';
import { Project } from '../models/project';
import ProjectDB from '../database/project';
import { Annotation } from '../models/annotation';

const projectDB = new ProjectDB();
const documentationDB = new DocumentationDB();
const annotationDB = new AnnotationDB();
const router = express.Router();

/**
 * Gets all projects
 * @returns {Project[]} A list of all projects
 * @throws {Error} Throws an error if projects could not be retrieved
 */
router.get("/", async (req, res) => {
    try {
        const projectId = req.query.projectId as string;
        const projects = await projectDB.getAll(projectId);
        res.send(JSON.stringify(projects));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Gets all documentations by project
 * @param {string} req.params.id - The ID of the project to retrieve documentations for
 * @returns {Documentation[]} A list of all documentation
 * @throws {Error} Throws an error if the documents could not be retrieved
 */
router.get("/:id/documentations", async (req, res) => {
    try {
        const projectId = req.params.id as string;
        if (!projectId) {
            res.sendStatus(400);
            return;
        }
        const documentations = await documentationDB.getAll(projectId);
        res.send(JSON.stringify(documentations));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


/**
 * Gets project by ID
 * @param {string} req.params.id - The ID of the project to retrieve
 * @returns {Project} The project with the specified ID
 * @throws {Error} Throws an error if the document could not be retrieved
*/
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const project = await projectDB.get(id);
        res.send(JSON.stringify(project));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Inserts a new project
 * @param {Project} req.body - The project to insert
 * @returns {string} The ID of the inserted document
 */
router.post("/", async (req, res) => {
    try {
        const project = req.body as Project;
        const id = await projectDB.insert(project);
        res.send(id);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Imports a documentation into the project.
 * @param {string} req.params.id - The ID of the project to import the documentation into
 */
router.post("/:id/import", async (req, res) => {
    try {
        const { documentation, annotations }
            : { documentation: Documentation, annotations: Annotation[] }
            = req.body;

        documentation.projectId = req.params.id;
        await whitelistOrigin(documentation.url);
        const docId = (await documentationDB.insert(documentation)).toString();

        for (const annotation of annotations) {
            annotation.documentationId = docId;
            await annotationDB.insert(annotation);
        }
        res.send(docId);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


/**
 * Updates a project
 * @param {string} req.params.id - The ID of the document to update
 * @param {Project} req.body - The updated project data
 * @returns {boolean} True if the project was updated, false otherwise
 * @throws {Error} Throws an error if the project could not be updated
*/
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const project = req.body as Project;
        const result = await projectDB.update(id, project);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Deletes a project
 * @param {string} req.params.id - The ID of the project to delete
 * @returns {boolean} True if the project was deleted, false otherwise
 * @throws {Error} Throws an error if the project could not be deleted
 */
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await projectDB.delete(id);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

export default router;