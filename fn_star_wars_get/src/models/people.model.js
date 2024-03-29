const { LanguageNotSupported } = require("../utils/errors.js");

const {
    URL_SWAPI,
    STAR_WARS_TABLE_DB,
} = require("../utils/config.js");
const ConsultsDynamoDB = require("../utils/dynamodb.client.js");
const ConsultsAxios = require("../utils/axios.client.js");

class PeopleDAO {
    constructor(db_client) {
        this.dynamo_commander = new ConsultsDynamoDB(
            db_client,
            "people",
            STAR_WARS_TABLE_DB
        );
    }

    async getAllPeople(startKey, limit) {
        console.log("Getting pagination of people in DB");
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

    async getPersonById(id) {
        console.log(`Getting person with id ${id}`);
        try {
            // Search in database
            const item = await this.dynamo_commander.getItemById(id);
            if (item) {
                console.log("Person found in DB");
                return item;
            } else {
                console.log("Getting person from API. Not in database");
                // If not in database search in api star wars
                const object_swapi = await ConsultsAxios.getCommand(`${URL_SWAPI}/people/${id}`);
                // Translate result to put it in db
                const person = {
                    schema_name: "people",
                    object_id: `${id}`,
                    name: object_swapi?.name ? object_swapi["name"] : null,
                    height: object_swapi?.height
                        ? object_swapi["height"]
                        : null,
                    mass: object_swapi?.mass ? object_swapi["mass"] : null,
                    hair_color: object_swapi?.hair_color
                        ? object_swapi["hair_color"]
                        : null,
                    skin_color: object_swapi?.skin_color
                        ? object_swapi["skin_color"]
                        : null,
                    eye_color: object_swapi?.eye_color
                        ? object_swapi["eye_color"]
                        : null,
                    birth_year: object_swapi?.birth_year
                        ? object_swapi["birth_year"]
                        : null,
                    gender: object_swapi?.gender
                        ? object_swapi["gender"]
                        : null,
                    homeworld: object_swapi?.homeworld
                        ? object_swapi["homeworld"]
                        : null,
                    films: object_swapi?.films ? object_swapi["films"] : [],
                    species: object_swapi?.species
                        ? object_swapi["species"]
                        : [],
                    vehicles: object_swapi?.vehicles
                        ? object_swapi["vehicles"]
                        : [],
                    starships: object_swapi?.starships
                        ? object_swapi["starships"]
                        : [],
                    created: new Date().toISOString(),
                    edited: new Date().toISOString(),
                    url: `${global.API_GATEWAY_URL}/people/${id}`,
                };
                // Put person in table
                await this.dynamo_commander.putItem(person);
                console.log("Success saving person in db");
                return person;
            }
        } catch (error) {
            console.error(`Could not get person from DB ${error}`);
            throw error;
        }
    }

    static async translatePerson(person, language) {
        delete person.schema_name;
        switch (language) {
            case "es_PE":
                return {
                    object_id: person.object_id,
                    nombre: person.name,
                    estatura: person.height,
                    peso: person.mass,
                    color_de_pelo: person.hair_color,
                    color_de_piel: person.skin_color,
                    color_de_ojo: person.eye_color,
                    nacimiento: person.birth_year,
                    genero: person.gender,
                    mundo: person.homeworld,
                    peliculas: person.films,
                    especies: person.species,
                    vehiculos: person.vehicles,
                    naves: person.starships,
                    creado_en: person.created,
                    editado_en: person.edited,
                    url: person.url,
                };
            case "en_US":
                return { ...person };
            default:
                console.warn("Language not supported");
                throw new LanguageNotSupported("Language not supported");
        }
    }
}

module.exports = PeopleDAO;
