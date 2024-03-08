const express = require("express");
const PlanetsService = require('../services/planets.service');
const { LanguageNotSupported, ResourceNotFoundExternalService } = require("../utils/errors");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        console.log("Route to get planets");
        const planetsService = new PlanetsService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await planetsService.processPlanets(req.query.lastKey);
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

router.get("/:planetId", async (req, res) => {
    try {
        console.log("Route to get planet by Id");
        const planetsService = new PlanetsService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await planetsService.processPlanet(
            req.params.planetId
        );
        res.json(converted);
    } catch (error) {
        console.error(error);
        if (error instanceof LanguageNotSupported) {
            res.status(400).json({ error: "Language not Supported" });
        } else if (error instanceof ResourceNotFoundExternalService) {
            res.status(404).json({ error: "Not Found" });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

module.exports = router;
