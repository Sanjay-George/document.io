import express from "express";
import OriginDB from "../database/origin";
import AnnotationDB from "../database/annotation";
import { AnnotationFilters } from "../filters/annotation_filters";
import DocumentationDB from "../database/documentation";
import { Documentation } from "../models/documentation";

const documentationDB = new DocumentationDB();
const annotationDB = new AnnotationDB();
const originDB = new OriginDB();
const router = express.Router();


/**
 * Gets a documentation by ID
 * @param {string} req.params.id - The ID of the documentation to retrieve
 * @returns {Documentation} The documentation with the specified ID
 * @throws {Error} Throws an error if the documentation could not be retrieved
 */
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const doc = await documentationDB.get(id);
        res.send(JSON.stringify(doc));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Gets all annotations for a documentation
 * @param {string} req.params.id - The ID of the documentation to retrieve
 * @returns {Annotation[]} Annotations with the specified ID
 * @throws {Error} Throws an error if annotations could not be retrieved
 */
router.get("/:id/annotations", async (req, res) => {
    try {
        const docId = req.params.id;
        const filters = req.query as AnnotationFilters;

        // TODO: Add middleware to decode all query parameters
        Object.keys(filters).forEach(key => {
            filters[key] = decodeURIComponent(filters[key]);
        });

        const annotations = await annotationDB.getAll(docId, filters);
        res.send(JSON.stringify(annotations));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Exports a documentation. Returns all data to recreate the documentation.
 */
router.get("/:id/export", async (req, res) => {
    try {
        const docId = req.params.id;
        let doc = await documentationDB.get(docId);
        doc = cleanData(doc);
        let annotations = await annotationDB.getAll(docId);
        annotations = annotations.map(i => cleanData(i));

        const data = {
            documentation: doc,
            annotations
        }
        res.send(JSON.stringify(data));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }

    function cleanData(data: any) {
        // Remove sensitive data
        delete data._id;
        delete data.id;
        delete data.projectId;
        delete data.documentationId;
        return data;
    }
});



/**
 * Inserts a new documentation
 * Whitelists the origin of the documentation URL
 * @param {Documentation} req.body - The documentation to insert
 * @returns {string} The ID of the inserted documentation
 */
router.post("/", async (req, res) => {
    try {
        const doc = req.body as Documentation;
        const { projectId } = doc;
        if (!projectId) {
            res.sendStatus(400);
            return;
        }

        const id = await documentationDB.insert(doc);
        await whitelistOrigin(doc.url);
        res.send(id);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

export async function whitelistOrigin(url: string) {
    const urlOrigin = (new URL(url)).origin;
    await originDB.insert(urlOrigin);
}


/**
 * Updates a documentation
 * @param {string} req.params.id - The ID of the documentation to update
 * @param {Documentation} req.body - The updated documentation
 * @returns {boolean} True if the documentation was updated, false otherwise
 */
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const doc = req.body as Documentation;
        const result = await documentationDB.update(id, doc);
        await whitelistOrigin(doc.url);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Deletes a documentation
 * @param {string} req.params.id - The ID of the documentation to delete
 * @returns {boolean} True if the documentation was deleted, false otherwise
 */
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await annotationDB.deleteByDocumentationId(id);
        const result = await documentationDB.delete(id);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


export default router;