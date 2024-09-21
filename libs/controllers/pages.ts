import express from "express";
import { Page } from "../models/page";
import PageDB from "../database/page";
import OriginDB from "../database/origin";
import AnnotationDB from "../database/annotation";

const pageDB = new PageDB();
const annotationDB = new AnnotationDB();
const originDB = new OriginDB();
const router = express.Router();


/**
 * Gets all pages by filters.
 * @returns {Page[]} A list of all pages
 * @throws {Error} Throws an error if the pages could not be retrieved
 */
router.get("/", async (req, res) => {
    // try {
    //     const documentationId = req.query.documentationId as string;
    //     if (!documentationId) {
    //         res.sendStatus(400);
    //         return;
    //     }
    //     const pages = await pageDB.getAll(documentationId);
    //     res.send(JSON.stringify(pages));
    // }
    // catch (ex) {
    //     console.error(ex);
    //     res.sendStatus(500);
    // }
    res.sendStatus(404);
});

/**
 * Gets a page by ID
 * @param {string} req.params.id - The ID of the page to retrieve
 * @returns {Page} The page with the specified ID
 * @throws {Error} Throws an error if the page could not be retrieved
 */
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const page = await pageDB.get(id);
        res.send(JSON.stringify(page));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Gets all annotations for a page
 * @param {string} req.params.id - The ID of the page to retrieve
 * @returns {Annotation[]} Annotations with the specified ID
 * @throws {Error} Throws an error if annotations could not be retrieved
 */
router.get("/:id/annotations", async (req, res) => {
    try {
        const pageId = req.params.id;
        const annotations = await annotationDB.getAll(pageId);
        res.send(JSON.stringify(annotations));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Exports a page. Returns all data to recreate the page.
 */
router.get("/:id/export", async (req, res) => {
    try {
        const id = req.params.id;
        let page = await pageDB.get(id);
        page = cleanData(page);
        let annotations = await annotationDB.getAll(id);
        annotations = annotations.map(i => cleanData(i));

        const data = {
            page,
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
        delete data.pageId;
        delete data.documentationId;
        return data;
    }
});



/**
 * Inserts a new page
 * @param {Page} req.body - The page to insert
 * @returns {string} The ID of the inserted page
 */
router.post("/", async (req, res) => {
    try {
        const page = req.body as Page;
        const { documentationId } = page;
        if (!documentationId) {
            res.sendStatus(400);
            return;
        }

        const id = await pageDB.insert(page);
        await whitelistOrigin(page.url);
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
 * Updates a page
 * @param {string} req.params.id - The ID of the page to update
 * @param {Page} req.body - The updated page
 * @returns {boolean} True if the page was updated, false otherwise
 */
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const page = req.body as Page;
        const result = await pageDB.update(id, page);
        await whitelistOrigin(page.url);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Deletes a page
 * @param {string} req.params.id - The ID of the page to delete
 * @returns {boolean} True if the page was deleted, false otherwise
 */
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pageDB.delete(id);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


export default router;