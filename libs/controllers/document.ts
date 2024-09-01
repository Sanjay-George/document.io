import express from 'express';
import Document from '../database/document';

const documentDB = new Document();
const router = express.Router();

/**
 * Gets all documents by project Id
 * @param {string} req.query.projectId - The ID of the project to retrieve documents for
 * @returns {Document[]} A list of all documents
 * @throws {Error} Throws an error if the documents could not be retrieved
 */
router.get("/", async (req, res) => {
    try {
        const projectId = req.query.projectId as string;
        const documents = await documentDB.getAll(projectId);
        res.send(JSON.stringify(documents));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


/**
 * Gets a document by ID
 * @param {string} req.params.id - The ID of the document to retrieve
 * @returns {Document} The document with the specified ID
 * @throws {Error} Throws an error if the document could not be retrieved
*/
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const document = await documentDB.get(id);
        res.send(JSON.stringify(document));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Inserts a new document
 * @param {Document} req.body - The document to insert
 * @returns {string} The ID of the inserted document
 */
router.post("/", async (req, res) => {
    try {
        const document = req.body as Document;
        const id = await documentDB.insert(document);
        res.send(id);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Updates a document
 * @param {string} req.params.id - The ID of the document to update
 * @param {Document} req.body - The updated document
 * @returns {boolean} True if the document was updated, false otherwise
 * @throws {Error} Throws an error if the document could not be updated
*/
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const document = req.body;
        const result = await documentDB.update(id, document);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Deletes a document
 * @param {string} req.params.id - The ID of the document to delete
 * @returns {boolean} True if the document was deleted, false otherwise
 * @throws {Error} Throws an error if the document could not be deleted
 */
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await documentDB.delete(id);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

export default router;