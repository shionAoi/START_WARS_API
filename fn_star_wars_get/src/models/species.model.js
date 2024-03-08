const { LanguageNotSupported } = require("../utils/errors.js");

const { URL_SWAPI, STAR_WARS_TABLE_DB } = require("../utils/config.js");
const ConsultsDynamoDB = require("../utils/dynamodb.client.js");
const ConsultsAxios = require("../utils/axios.client.js");

class SpeciesDAO {
    constructor(db_client) {
        this.dynamo_commander = new ConsultsDynamoDB(
            db_client,
            "species",
            STAR_WARS_TABLE_DB
        );
    }

    async getAllSpecies(startKey, limit) {
        console.log("Getting pagination of species in DB");
        const count = await this.dynamo_commander.getTotalNumberItems();
        const pagination = await this.dynamo_commander.getAllItems(
            startKey,
            limit
        );
        return {
            count,
            ...pagination,
        };
    }

    async getSpecieById(id) {
        console.log(`Getting specie with id ${id}`);
        try {
            // Search in database
            const item = await this.dynamo_commander.getItemById(id);
            if (item) {
                console.log("Specie found in DB");
                return item;
            } else {
                console.log("Getting specie from API. Not in database");
                // If not in database search in api star wars
                const object_swapi = await ConsultsAxios.getCommand(
                    `${URL_SWAPI}/species/${id}`
                );
                // Translate result to put it in db
                const specie = {
                    schema_name: "species",
                    object_id: `${id}`,
                    name: object_swapi?.name ? object_swapi["name"] : null,
                    classification: object_swapi?.classification
                        ? object_swapi["classification"]
                        : null,
                    designation: object_swapi?.designation
                        ? object_swapi["designation"]
                        : null,
                    average_height: object_swapi?.average_height
                        ? object_swapi["average_height"]
                        : null,
                    average_lifespan: object_swapi?.average_lifespan
                        ? object_swapi["average_lifespan"]
                        : null,
                    eye_colors: object_swapi?.eye_colors
                        ? object_swapi["eye_colors"]
                        : null,
                    hair_colors: object_swapi?.hair_colors
                        ? object_swapi["hair_colors"]
                        : null,
                    skin_colors: object_swapi?.skin_colors
                        ? object_swapi["skin_colors"]
                        : null,
                    language: object_swapi?.language
                        ? object_swapi["language"]
                        : null,
                    homeworld: object_swapi?.homeworld
                        ? object_swapi["homeworld"]
                        : null,
                    people: object_swapi?.people ? object_swapi["people"] : [],
                    films: object_swapi?.films ? object_swapi["films"] : [],
                    created: new Date().toISOString(),
                    edited: new Date().toISOString(),
                    url: `${global.API_GATEWAY_URL}/species/${id}`,
                };
                // Put specie in table
                await this.dynamo_commander.putItem(specie);
                console.log("Success saving specie in db");
                return specie;
            }
        } catch (error) {
            console.error(`Could not get specie from DB ${error}`);
            throw error;
        }
    }

    static async translateSpecie(specie, language) {
        delete specie.schema_name;
        switch (language) {
            case "es_PE":
                return {
                    object_id: specie.object_id,
                    clasificacion: specie.classification,
                    designacion: specie.designation,
                    altura_promedio: specie.average_height,
                    tiempo_de_vida_promedio: specie.average_lifespan,
                    colores_de_ojo: specie.eye_colors,
                    colores_de_pelo: specie.hair_colors,
                    colores_de_piel: specie.skin_colors,
                    language: specie.language,
                    mundo: specie.homeworld,
                    habitantes: specie.people,
                    peliculas: specie.films,
                    creado_en: specie.created,
                    editado_en: specie.edited,
                    url: specie.url,
                };
            case "en_US":
                return { ...specie };
            default:
                console.warn("Language not supported");
                throw new LanguageNotSupported("Language not supported");
        }
    }
}

module.exports = SpeciesDAO;
