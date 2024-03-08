const express = require("express");
const { LanguageNotSupported, ResourceNotFoundExternalService } = require("../utils/errors");
const VehiclesService = require("../services/vehicles.service");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        console.log("Route to get vehicles");
        const vehiclesService = new VehiclesService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await vehiclesService.processVehicles(req.query.lastKey);
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

router.get("/:vehicleId", async (req, res) => {
    try {
        console.log("Route to get vehicle by Id");
        const vehicleService = new VehiclesService(
            req.app.get("db_client"),
            req.app.get("language")
        );
        const converted = await vehicleService.processVehicle(
            req.params.vehicleId
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
