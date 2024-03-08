const express = require("express");
const { LanguageNotSupported, ResourceNotFoundExternalService } = require("../utils/errors");
const StarShipsService = require("../services/starships.service");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        console.log("Route to get starship");
        const starshipService = new StarShipsService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await starshipService.processStarShips(req.query.lastKey);
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

router.get("/:starshipId", async (req, res) => {
    try {
        console.log("Route to get starship by Id");
        const starshipService = new StarShipsService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await starshipService.processStarShip(
            req.params.starshipId
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
