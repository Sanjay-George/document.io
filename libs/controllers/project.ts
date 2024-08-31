import express from 'express';
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        // let projectList = await projectsDL.getAll();
        res.send(JSON.stringify(projectList));
    }
    catch (ex) {
        console.error(ex);
        res.sendStatus(500);
    }
});

const projectList = [
    {
        name: "Project 1",
        description: "Description 1",
        status: "Active",
        lastRun: "2021-07-01T00:00:00.000Z"
    },
    {
        name: "Project 2",
        description: "Description 2",
        status: "Inactive",
        lastRun: "2021-07-01T00:00:00.000Z"
    }
];

export default router;