import express from "express";

import Origin from "../database/origin";

const originDB = new Origin();
const router = express.Router();

/**
 * Gets all whitelisted origins

 * @throws {Error} Throws an error if the annotation could not be retrieved
 */
router.get("/", async (req, res) => {
    try {
        const whitelistedOrigins = await originDB.getAll();
        res.send(JSON.stringify(whitelistedOrigins));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});


export default router;