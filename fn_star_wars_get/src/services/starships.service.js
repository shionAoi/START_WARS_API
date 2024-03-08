const StarShipsDAO = require("../models/starships.model");
const { DEFAULT_PAGINATION_ITEMS } = require("../utils/config");

class StarShipsService {
    constructor(db_client, language) {
        this.starship_dao = new StarShipsDAO(db_client);
        this.language = language;
    }

    async processStarShip(starship_id) {
        try {
            const starship = await this.starship_dao.getStarShipById(starship_id);
            const translated = await StarShipsDAO.translateStarShip(
                starship,
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
            console.error(`Could not get starship. ${error}`);
            throw error;
        }
    }

    async processStarShips(key) {
        let results = [];
        let success = "false";
        try {
            const { accumulated, lastKey, count } =
                await this.starship_dao.getAllStarShips(
                    key,
                    DEFAULT_PAGINATION_ITEMS
                );
            if (accumulated && accumulated.length > 0) {
                await Promise.all(
                    accumulated.map(async (item) => {
                        try {
                            const aux = await StarShipsDAO.translateStarShip(
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
                    starships: results,
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
            console.error(`Could not get list of starships. ${error}`);
            throw error;
        }
    }
}

module.exports = StarShipsService;
