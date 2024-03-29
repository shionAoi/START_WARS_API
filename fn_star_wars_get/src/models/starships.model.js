const { LanguageNotSupported } = require("../utils/errors.js");
const axios = require("axios");

const {
    URL_SWAPI,
    STAR_WARS_TABLE_DB,
    AXIOS_DEFAULT_TIME,
} = require("../utils/config.js");
const ConsultsDynamoDB = require("../utils/dynamodb.client.js");
const ConsultsAxios = require("../utils/axios.client.js");

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
                console.log("Starship found in DB");
                return item;
            } else {
                console.log("Getting starship from API. Not in database");
                // If not in database consult to api star wars
                const object_swapi = await ConsultsAxios.getCommand(`${URL_SWAPI}/starships/${id}`);
                // Translate result to put it in db
                const starship = {
                    schema_name: "starships",
                    object_id: `${id}`,
                    name: object_swapi?.name ? object_swapi["name"] : null,
                    model: object_swapi?.model ? object_swapi["model"] : null,
                    starship_class: object_swapi?.starship_class
                        ? object_swapi["starship_class"]
                        : null,
                    manufacturer: object_swapi?.manufacturer
                        ? object_swapi["manufacturer"]
                        : null,
                    cost_in_credits: object_swapi?.cost_in_credits
                        ? object_swapi["cost_in_credits"]
                        : null,
                    length: object_swapi?.length
                        ? object_swapi["length"]
                        : null,
                    crew: object_swapi?.crew ? object_swapi["crew"] : null,
                    passengers: object_swapi?.passengers
                        ? object_swapi["passengers"]
                        : null,
                    max_atmosphering_speed: object_swapi
                        ?.max_atmosphering_speed
                        ? object_swapi["max_atmosphering_speed"]
                        : null,
                    hyperdrive_rating: object_swapi?.hyperdrive_rating
                        ? object_swapi["hyperdrive_rating"]
                        : null,
                    MGLT: object_swapi?.MGLT ? object_swapi["MGLT"] : null,
                    cargo_capacity: object_swapi?.cargo_capacity
                        ? object_swapi["cargo_capacity"]
                        : null,
                    consumables: object_swapi?.consumables
                        ? object_swapi["consumables"]
                        : null,
                    films: object_swapi?.films ? object_swapi["films"] : [],
                    pilots: object_swapi?.pilots
                        ? object_swapi["pilots"]
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
                    object_id: starship.object_id,
                    nombre: starship.name,
                    modelo: starship.model,
                    clase_de_nave: starship.starship_class,
                    fabricante: starship.manufacturer,
                    costo: starship.cost_in_credits,
                    longitud: starship.length,
                    tripulantes: starship.crew,
                    pasajeros: starship.passengers,
                    velocidad_atmosferica_maxima: starship.max_atmosphering_speed,
                    calificacion_de_hiperpropulsor: starship.hyperdrive_rating,
                    MGLT: starship.MGLT,
                    capacidad_de_carga: starship.cargo_capacity,
                    consumibles: starship.consumables,
                    peliculas: starship.films,
                    pilotos: starship.pilots,
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
