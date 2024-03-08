const express = require("express");
const { LanguageNotSupported } = require("../utils/errors");
const FilmsService = require("../services/films.service");
const { AxiosError } = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        console.log("Route to get films");
        const filmService = new FilmsService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await filmService.processFilms(req.query.lastKey);
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

router.get("/:filmId", async (req, res) => {
    try {
        console.log("Route to get person by Id");
        const filmService = new FilmsService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await filmService.processFilm(req.params.filmId);
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
