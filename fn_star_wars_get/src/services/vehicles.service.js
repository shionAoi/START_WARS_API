const VehiclesDAO = require("../models/vehicles.model");
const { DEFAULT_PAGINATION_ITEMS } = require("../utils/config");

class VehiclesService {
    constructor(db_client, language) {
        this.vehicle_dao = new VehiclesDAO(db_client);
        this.language = language;
    }

    async processVehicle(vehicle_id) {
        try {
            const vehicle = await this.vehicle_dao.getVehicleById(vehicle_id);
            const translated = await VehiclesDAO.translateVehicle(
                vehicle,
                this.language
            );
            return {
                success: true,
                response: {
                    ...translated,
                    meta: {
                        default_language: this.language,
                    },
                },
            };
        } catch (error) {
            console.error(`Could not get vehicle. ${error}`);
            throw error;
        }
    }

    async processVehicles(key) {
        let results = [];
        let success = "false";
        try {
            const { accumulated, lastKey, count } =
                await this.vehicle_dao.getAllVehicles(
                    key,
                    DEFAULT_PAGINATION_ITEMS
                );
            if (accumulated && accumulated.length > 0) {
                await Promise.all(
                    accumulated.map(async (item) => {
                        try {
                            const aux = await VehiclesDAO.translateVehicle(
                                item,
                                this.language
                            );
                            results.push(aux);
                        } catch (error) {
                            console.error("Error processing item:", error);
                            throw error;
                        }
                    })
                );
                success = "true";
            }
            return {
                success,
                response: {
                    vehicles: results,
                    meta: {
                        total_items: count,
                        next_key: lastKey,
                        previous_key: key,
                        pagination: DEFAULT_PAGINATION_ITEMS,
                        default_language: this.language,
                    },
                },
            };
        } catch (error) {
            console.error(`Could not get list of vehicles. ${error}`);
            throw error;
        }
    }
}

module.exports = VehiclesService;
