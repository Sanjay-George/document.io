import express from 'express';
import Document from '../database/document';

const documentDB = new Document();
const router = express.Router();

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


export default router;