const PlanetsDAO = require('../models/planets.model');
const { DEFAULT_PAGINATION_ITEMS } = require("../utils/config");

class PlanetsService {
    constructor(db_client, language) {
        this.planets_dao = new PlanetsDAO(db_client);
        this.language = language;
    }

    async processPlanet(planet_id) {
        try {
            const planet = await this.planets_dao.getPlanetById(planet_id);
            const translated = await PlanetsDAO.translatePlanet(
                planet,
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
            console.error(`Could not get planet. ${error}`);
            throw error;
        }
    }

    async processPlanets(key) {
        let results = [];
        let success = "false";
        try {
            const { accumulated, lastKey, count } =
                await this.planets_dao.getAllPlanets(
                    key,
                    DEFAULT_PAGINATION_ITEMS
                );
            if (accumulated && accumulated.length > 0) {
                await Promise.all(
                    accumulated.map(async (item) => {
                        try {
                            const aux = await PlanetsDAO.translatePlanet(
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
                    planets: results,
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
            console.error(`Could not get list of planets. ${error}`);
            throw error;
        }
    }
}

module.exports = PlanetsService;
