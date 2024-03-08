const express = require("express");
const { LanguageNotSupported, ResourceNotFoundExternalService } = require("../utils/errors");
const SpeciesService = require("../services/species.service");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        console.log("Route to get species");
        const speciesService = new SpeciesService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await speciesService.processSpecies(req.query.lastKey);
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

router.get("/:specieId", async (req, res) => {
    try {
        console.log("Route to get specie by Id");
        const speciesService = new SpeciesService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await speciesService.processSpecie(
            req.params.specieId
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
