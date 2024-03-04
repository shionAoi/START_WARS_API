const { LanguageNotSupported } = require("../utils/errors.js");
const axios = require("axios");

const { URL_SWAPI, STAR_WARS_TABLE_DB } = require("../utils/config.js");
const ConsultsDynamoDB = require("../utils/consults.dynamo.js");

class PeopleDAO {
    constructor(db_client) {
        this.dynamo_commander = new ConsultsDynamoDB(
            db_client,
            "people",
            STAR_WARS_TABLE_DB
        );
    }

    async getAllPeople(startKey, limit) {
        console.log("Getting pagination of people in BD");
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
                return item
            } else {
                console.log("Getting person from API. Not in database");
                // If not in database consult to api star wars
                const response = await axios.get(`${URL_SWAPI}/people/${id}`, {
                    validateStatus: (status) => {
                        return status === 200;
                    },
                });
                console.log(
                    `Success getting response from api ${JSON.stringify(
                        response.data
                    )}`
                );
                // Translate result to put it in db
                const person = {
                    schema_name: "people",
                    object_id: `${id}`,
                    name: response.data?.name ? response.data["name"] : null,
                    height: response.data?.height
                        ? response.data["height"]
                        : null,
                    mass: response.data?.mass ? response.data["mass"] : null,
                    hair_color: response.data?.hair_color
                        ? response.data["hair_color"]
                        : null,
                    skin_color: response.data?.skin_color
                        ? response.data["skin_color"]
                        : null,
                    eye_color: response.data?.eye_color
                        ? response.data["eye_color"]
                        : null,
                    birth_year: response.data?.birth_year
                        ? response.data["birth_year"]
                        : null,
                    gender: response.data?.gender
                        ? response.data["gender"]
                        : null,
                    homeworld: response.data?.homeworld
                        ? response.data["homeworld"]
                        : null,
                    films: response.data?.films ? response.data["films"] : [],
                    species: response.data?.species
                        ? response.data["species"]
                        : [],
                    vehicles: response.data?.vehicles
                        ? response.data["vehicles"]
                        : [],
                    starships: response.data?.starships
                        ? response.data["starships"]
                        : [],
                    created: new Date().toISOString(),
                    edited: new Date().toISOString(),
                    url: `${global.API_GATEWAY_URL}/people/${id}`
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
        delete person.object_id;
        switch (language) {
            case "es_PE":
                return {
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
