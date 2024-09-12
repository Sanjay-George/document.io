import express from "express";
import { Page } from "../models/page";
import PageDB from "../database/page";

const pageDB = new PageDB();
const router = express.Router();


/**
 * Gets all page by documentation
 * @param {string} req.query.documentationId - documentationId ID to retrieve pages for (optional)
 * @returns {Page[]} A list of all pages
 * @throws {Error} Throws an error if the documents could not be retrieved
 */
router.get("/", async (req, res) => {
    try {
        const documentationId = req.query.documentationId as string;
        const pages = await pageDB.getAll(documentationId);
        res.send(JSON.stringify(pages));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
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
 * Inserts a new page
 * @param {Page} req.body - The page to insert
 * @returns {string} The ID of the inserted page
 */
router.post("/", async (req, res) => {
    try {
        const page = req.body as Page;
        const id = await pageDB.insert(page);
        res.send(id);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


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