import express from 'express';
import DocumentationDB from '../database/documentation';
import PageDB from '../database/page';
import { Documentation } from '../models/documentation';

const documentationDB = new DocumentationDB();
const pagesDB = new PageDB();
const router = express.Router();

/**
 * Gets all documentations by project Id
 * @param {string} req.query.projectId - Project ID to retrieve documents for (optional)
 * @returns {Document[]} A list of all documentations
 * @throws {Error} Throws an error if the documents could not be retrieved
 */
router.get("/", async (req, res) => {
    try {
        const projectId = req.query.projectId as string;
        const documents = await documentationDB.getAll(projectId);
        res.send(JSON.stringify(documents));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Gets all pages by documentation
 * @param {string} req.query.documentationId - documentationId ID to retrieve pages for (optional)
 * @returns {Page[]} A list of all pages
 * @throws {Error} Throws an error if the documents could not be retrieved
 */
router.get("/:id/pages", async (req, res) => {
    try {
        const documentationId = req.params.id as string;
        if (!documentationId) {
            res.sendStatus(400);
            return;
        }
        const pages = await pagesDB.getAll(documentationId);
        res.send(JSON.stringify(pages));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});



/**
 * Gets a documentation by ID
 * @param {string} req.params.id - The ID of the document to retrieve
 * @returns {Document} The document with the specified ID
 * @throws {Error} Throws an error if the document could not be retrieved
*/
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const document = await documentationDB.get(id);
        res.send(JSON.stringify(document));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Inserts a new documentation
 * @param {Document} req.body - The document to insert
 * @returns {string} The ID of the inserted document
 */
router.post("/", async (req, res) => {
    try {
        const document = req.body as Documentation;
        const id = await documentationDB.insert(document);
        res.send(id);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Updates a documentation
 * @param {string} req.params.id - The ID of the document to update
 * @param {Document} req.body - The updated document
 * @returns {boolean} True if the document was updated, false otherwise
 * @throws {Error} Throws an error if the document could not be updated
*/
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const document = req.body;
        const result = await documentationDB.update(id, document);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Deletes a documentation
 * @param {string} req.params.id - The ID of the document to delete
 * @returns {boolean} True if the document was deleted, false otherwise
 * @throws {Error} Throws an error if the document could not be deleted
 */
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await documentationDB.delete(id);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

export default router;