const { LanguageNotSupported } = require("../utils/errors.js");

const {
    URL_SWAPI,
    STAR_WARS_TABLE_DB,
} = require("../utils/config.js");
const ConsultsDynamoDB = require("../utils/dynamodb.client.js");
const ConsultsAxios = require("../utils/axios.client.js");

class VehiclesDAO {
    constructor(db_client) {
        this.dynamo_commander = new ConsultsDynamoDB(
            db_client,
            "vehicles",
            STAR_WARS_TABLE_DB
        );
    }

    async getAllVehicles(startKey, limit) {
        console.log("Getting pagination of vehicles in DB");
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

    async getVehicleById(id) {
        console.log(`Getting vehicle with id ${id}`);
        try {
            // Search in database
            const item = await this.dynamo_commander.getItemById(id);
            if (item) {
                console.log("Vehicle found in DB");
                return item;
            } else {
                console.log("Getting vehicle from API. Not in database");
                // If not in database search in api star wars
                const object_swapi = await ConsultsAxios.getCommand(`${URL_SWAPI}/vehicles/${id}`);
                // Translate result to put it in db
                const vehicle = {
                    schema_name: "vehicles",
                    object_id: `${id}`,
                    name: object_swapi?.name ? object_swapi["name"] : null,
                    model: object_swapi?.model
                        ? object_swapi["model"]
                        : null,
                    vehicle_class: object_swapi?.vehicle_class ? object_swapi["vehicle_class"] : null,
                    manufacturer: object_swapi?.manufacturer
                        ? object_swapi["manufacturer"]
                        : null,
                    length: object_swapi?.length
                        ? object_swapi["length"]
                        : null,
                    cost_in_credits: object_swapi?.cost_in_credits
                        ? object_swapi["cost_in_credits"]
                        : null,
                    crew: object_swapi?.crew
                        ? object_swapi["crew"]
                        : null,
                    passengers: object_swapi?.passengers
                        ? object_swapi["passengers"]
                        : null,
                    max_atmosphering_speed: object_swapi?.max_atmosphering_speed
                        ? object_swapi["max_atmosphering_speed"]
                        : null,
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
                    url: `${global.API_GATEWAY_URL}/vehicles/${id}`,
                };
                // Put vehicle in table
                await this.dynamo_commander.putItem(vehicle);
                console.log("Success saving vehicle in db");
                return vehicle;
            }
        } catch (error) {
            console.error(`Could not get vehicle from DB ${error}`);
            throw error;
        }
    }

    static async translateVehicle(vehicle, language) {
        delete vehicle.schema_name;
        switch (language) {
            case "es_PE":
                return {
                    object_id: vehicle.object_id,
                    nombre: vehicle.name,
                    modelo: vehicle.model,
                    clase: vehicle.vehicle_class,
                    fabricante: vehicle.manufacturer,
                    longitud: vehicle.length,
                    costo_en_creditos: vehicle.cost_in_credits,
                    tripulacion: vehicle.crew,
                    pasajeros: vehicle.passengers,
                    velocidad_atmosferica_maxima: vehicle.max_atmosphering_speed,
                    capacidad_de_carga: vehicle.cargo_capacity,
                    consumibles: vehicle.consumables,
                    peliculas: vehicle.films,
                    pilotos: vehicle.pilots,
                    creado_en: vehicle.created,
                    editado_en: vehicle.edited,
                    url: vehicle.url,
                };
            case "en_US":
                return { ...vehicle };
            default:
                console.warn("Language not supported");
                throw new LanguageNotSupported("Language not supported");
        }
    }
}

module.exports = VehiclesDAO;
