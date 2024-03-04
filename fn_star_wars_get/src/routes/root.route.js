const express = require("express");
const router = express.Router();
const RootService = require("../services/root.service.js");

router.get("/", async (req, res) => {
    try {
        console.log("Root route");
        const rootService = new RootService(req.app.get("language"));
        const converted = await rootService.processResponse();
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
