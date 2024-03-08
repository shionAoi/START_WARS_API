const SpeciesDAO = require("../models/species.model");
const { DEFAULT_PAGINATION_ITEMS } = require("../utils/config");

class SpeciesService {
    constructor(db_client, language) {
        this.species_dao = new SpeciesDAO(db_client);
        this.language = language;
    }

    async processSpecie(specie_id) {
        try {
            const specie = await this.species_dao.getSpecieById(specie_id);
            const translated = await SpeciesDAO.translateSpecie(
                specie,
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
            console.error(`Could not get specie. ${error}`);
            throw error;
        }
    }

    async processSpecies(key) {
        let results = [];
        let success = "false";
        try {
            const { accumulated, lastKey, count } =
                await this.species_dao.getAllSpecies(
                    key,
                    DEFAULT_PAGINATION_ITEMS
                );
            if (accumulated && accumulated.length > 0) {
                await Promise.all(
                    accumulated.map(async (item) => {
                        try {
                            const aux = await SpeciesDAO.translateSpecie(
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
                    species: results,
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
            console.error(`Could not get list of species. ${error}`);
            throw error;
        }
    }
}

module.exports = SpeciesService;
