import express from "express";
import { Annotation } from "../models/annotation";
import AnnotationDB from "../database/annotation";

const annotationDB = new AnnotationDB();
const router = express.Router();


/**
 * Gets an annotation by ID
 * @param {string} req.params.id - The ID of the annotation to retrieve
 * @returns {Page} The annotation with the specified ID
 * @throws {Error} Throws an error if the annotation could not be retrieved
 */
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const annotation = await annotationDB.get(id);
        res.send(JSON.stringify(annotation));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


/**
 * Inserts a new annotation
 * @param {Page} req.body - The annotation to insert
 * @returns {string} The ID of the inserted annotation
 */
router.post("/", async (req, res) => {
    try {
        const annotation = req.body as Annotation;
        if (!validateData(annotation)) {
            res.sendStatus(400);
            return;
        }
        const id = await annotationDB.insert(annotation);
        res.send(id);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

const validateData = (data: Annotation) => {
    if (!data.value || !data.target || !data.url || !data.documentationId) {
        return false;
    }
    return true;
}


/**
 * Updates an annotation
 * @param {string} req.params.id - The ID of the annotation to update
 * @param {Annotation} req.body - The updated annotation
 * @returns {boolean} True if the annotation was updated, false otherwise
 */
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const annotation = req.body as Annotation;
        if (!validateData(annotation)) {
            res.sendStatus(400);
            return;
        }
        const result = await annotationDB.update(id, annotation);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


/**
 * Updates multiple annotations
 * @param {Annotation[]} req.body - The annotations to update
 * @returns {boolean[]} An array of booleans indicating whether each annotation was updated
 */
router.put("/", async (req, res) => {
    try {
        const annotations = req.body as Annotation[];
        if (!annotations || annotations.length === 0) {
            res.sendStatus(400);
            return;
        }
        const resultArr = []
        for (const annotation of annotations) {
            if (!validateData(annotation)) {
                res.sendStatus(400);
                continue;
            }
            resultArr.push(await annotationDB.update(annotation.id, annotation));
        }
        res.send(resultArr);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

/**
 * Deletes a annotation
 * @param {string} req.params.id - The ID of the annotation to delete
 * @returns {boolean} True if the annotation was deleted, false otherwise
 */
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await annotationDB.delete(id);
        res.send(result);
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


export default router;