const { LanguageNotSupported } = require("../utils/errors.js");

const { URL_SWAPI, STAR_WARS_TABLE_DB } = require("../utils/config.js");
const ConsultsDynamoDB = require("../utils/dynamodb.client.js");
const ConsultsAxios = require("../utils/axios.client.js");

class PlanetsDAO {
    constructor(db_client) {
        this.dynamo_commander = new ConsultsDynamoDB(
            db_client,
            "planets",
            STAR_WARS_TABLE_DB
        );
    }

    async getAllPlanets(startKey, limit) {
        console.log("Getting pagination of planets in DB");
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

    async getPlanetById(id) {
        console.log(`Getting planet with id ${id}`);
        try {
            // Search in database
            const item = await this.dynamo_commander.getItemById(id);
            if (item) {
                console.log("Planet found in DB");
                return item;
            } else {
                console.log("Getting planet from API. Not in database");
                // If not in database search in api star wars
                const object_swapi = await ConsultsAxios.getCommand(
                    `${URL_SWAPI}/planets/${id}`
                );
                // Translate result to put it in db
                const planet = {
                    schema_name: "planets",
                    object_id: `${id}`,
                    name: object_swapi?.name ? object_swapi["name"] : null,
                    diameter: object_swapi?.diameter
                        ? object_swapi["diameter"]
                        : null,
                    rotation_period: object_swapi?.rotation_period
                        ? object_swapi["rotation_period"]
                        : null,
                    orbital_period: object_swapi?.orbital_period
                        ? object_swapi["orbital_period"]
                        : null,
                    gravity: object_swapi?.gravity
                        ? object_swapi["gravity"]
                        : null,
                    population: object_swapi?.population
                        ? object_swapi["population"]
                        : null,
                    climate: object_swapi?.climate
                        ? object_swapi["climate"]
                        : null,
                    terrain: object_swapi?.terrain
                        ? object_swapi["terrain"]
                        : null,
                    surface_water: object_swapi?.surface_water
                        ? object_swapi["surface_water"]
                        : null,
                    residents: object_swapi?.residents
                        ? object_swapi["residents"]
                        : [],
                    films: object_swapi?.films ? object_swapi["films"] : [],
                    created: new Date().toISOString(),
                    edited: new Date().toISOString(),
                    url: `${global.API_GATEWAY_URL}/planets/${id}`,
                };
                // Put planet in table
                await this.dynamo_commander.putItem(planet);
                console.log("Success saving planet in db");
                return planet;
            }
        } catch (error) {
            console.error(`Could not get planet from DB ${error}`);
            throw error;
        }
    }

    static async translatePlanet(planet, language) {
        delete planet.schema_name;
        switch (language) {
            case "es_PE":
                return {
                    object_id: planet.object_id,
                    nombre: planet.name,
                    diametro: planet.diameter,
                    periodo_de_rotacion: planet.rotation_period,
                    periodo_orbital: planet.orbital_period,
                    gravedad: planet.gravity,
                    poblacion: planet.population,
                    climas: planet.climate,
                    terrenos: planet.terrain,
                    superficie_con_agua: planet.surface_water,
                    residentes: planet.residents,
                    peliculas: planet.films,
                    creado_en: planet.created,
                    editado_en: planet.edited,
                    url: planet.url,
                };
            case "en_US":
                return { ...planet };
            default:
                console.warn("Language not supported");
                throw new LanguageNotSupported("Language not supported");
        }
    }
}

module.exports = PlanetsDAO;
