const express = require("express");
const PeopleService = require("../services/people.service");
const { LanguageNotSupported } = require("../utils/errors");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        console.log("Route to get people");
        const peopleService = new PeopleService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await peopleService.processPeople(req.query.lastKey);
        res.json(converted);
    } catch (error) {
        console.error(error);
        if (error instanceof LanguageNotSupported) {
            res.status(400).json({ error: "Language not Supported" });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

router.get("/:personId", async (req, res) => {
    try {
        console.log("Route to get person by Id");
        const peopleService = new PeopleService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await peopleService.processPerson(
            req.params.personId
        );
        res.json(converted);
    } catch (error) {
        console.error(error);
        if (error instanceof LanguageNotSupported) {
            res.status(400).json({ error: "Language not Supported" });
        } else if (error instanceof AxiosError) {
            res.status(404).json({ error: "Not Found" });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

module.exports = router;
