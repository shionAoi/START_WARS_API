const { LanguageNotSupported } = require("../utils/errors.js");
const axios = require("axios");

const {
    URL_SWAPI,
    STAR_WARS_TABLE_DB,
    AXIOS_DEFAULT_TIME,
} = require("../utils/config.js");
const ConsultsDynamoDB = require("../utils/consults.dynamo.js");

class StarShipsDAO {
    constructor(db_client) {
        this.dynamo_commander = new ConsultsDynamoDB(
            db_client,
            "starships",
            STAR_WARS_TABLE_DB
        );
    }

    async getAllStarShips(startKey, limit) {
        console.log("Getting pagination of starships in DB");
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

    async getStarShipById(id) {
        console.log(`Getting starship with id ${id}`);
        try {
            // Search in database
            const item = await this.dynamo_commander.getItemById(id);
            if (item) {
                return item;
            } else {
                console.log("Getting starship from API. Not in database");
                // If not in database consult to api star wars
                const response = await axios.get(
                    `${URL_SWAPI}/starships/${id}`,
                    {
                        timeout: AXIOS_DEFAULT_TIME,
                        validateStatus: (status) => {
                            return status === 200;
                        },
                    }
                );
                console.log(
                    `Success getting response from api ${JSON.stringify(
                        response.data
                    )}`
                );
                // Translate result to put it in db
                const starship = {
                    schema_name: "starships",
                    object_id: `${id}`,
                    name: response.data?.name ? response.data["name"] : null,
                    model: response.data?.model ? response.data["model"] : null,
                    starship_class: response.data?.starship_class
                        ? response.data["starship_class"]
                        : null,
                    manufacturer: response.data?.manufacturer
                        ? response.data["manufacturer"]
                        : null,
                    cost_in_credits: response.data?.cost_in_credits
                        ? response.data["cost_in_credits"]
                        : null,
                    length: response.data?.length
                        ? response.data["length"]
                        : null,
                    crew: response.data?.crew ? response.data["crew"] : null,
                    passengers: response.data?.passengers
                        ? response.data["passengers"]
                        : null,
                    max_atmosphering_speed: response.data
                        ?.max_atmosphering_speed
                        ? response.data["max_atmosphering_speed"]
                        : null,
                    hyperdrive_rating: response.data?.hyperdrive_rating
                        ? response.data["hyperdrive_rating"]
                        : null,
                    MGLT: response.data?.MGLT ? response.data["MGLT"] : null,
                    cargo_capacity: response.data?.cargo_capacity
                        ? response.data["cargo_capacity"]
                        : null,
                    consumables: response.data?.consumables
                        ? response.data["consumables"]
                        : null,
                    films: response.data?.films ? response.data["films"] : [],
                    pilots: response.data?.pilots
                        ? response.data["pilots"]
                        : [],
                    created: new Date().toISOString(),
                    edited: new Date().toISOString(),
                    url: `${global.API_GATEWAY_URL}/starships/${id}`,
                };
                // Put starship in table
                await this.dynamo_commander.putItem(starship);
                console.log("Success saving starship in db");
                return starship;
            }
        } catch (error) {
            console.error(`Could not get starship from DB ${error}`);
            throw error;
        }
    }

    static async translateStarShip(starship, language) {
        delete starship.schema_name;
        switch (language) {
            case "es_PE":
                return {
                    nombre: starship.name,
                    estatura: starship.height,
                    peso: starship.mass,
                    color_de_pelo: starship.hair_color,
                    color_de_piel: starship.skin_color,
                    color_de_ojo: starship.eye_color,
                    nacimiento: starship.birth_year,
                    genero: starship.gender,
                    mundo: starship.homeworld,
                    peliculas: starship.films,
                    especies: starship.species,
                    vehiculos: starship.vehicles,
                    naves: starship.starships,
                    creado_en: starship.created,
                    editado_en: starship.edited,
                    url: starship.url,
                };
            case "en_US":
                return { ...starship };
            default:
                console.warn("Language not supported");
                throw new LanguageNotSupported("Language not supported");
        }
    }
}

module.exports = StarShipsDAO;
