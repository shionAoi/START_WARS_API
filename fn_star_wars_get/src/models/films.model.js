const { LanguageNotSupported } = require("../utils/errors.js");
const axios = require("axios");

const { URL_SWAPI, STAR_WARS_TABLE_DB } = require("../utils/config.js");
const ConsultsDynamoDB = require("../utils/consults.dynamo.js");

class FilmsDAO {
    constructor(db_client) {
        this.dynamo_commander = new ConsultsDynamoDB(
            db_client,
            "films",
            STAR_WARS_TABLE_DB
        );
    }

    async getAllFilms(startKey, limit) {
        console.log("Getting pagination of films in BD");
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

    async getFilmById(id) {
        console.log(`Getting film with id ${id}`);
        try {
            // Search in database
            const item = await this.dynamo_commander.getItemById(id);
            if (item) {
                return item;
            } else {
                console.log("Getting film from API. Not in database");
                // If not in database consult to api star wars
                const response = await axios.get(`${URL_SWAPI}/films/${id}`, {
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
                const film = {
                    schema_name: "films",
                    object_id: `${id}`,
                    title: response.data?.title ? response.data["title"] : null,
                    episode_id: response.data?.episode_id
                        ? response.data["episode_id"]
                        : null,
                    opening_crawl: response.data?.opening_crawl
                        ? response.data["opening_crawl"]
                        : null,
                    director: response.data?.director
                        ? response.data["director"]
                        : null,
                    producer: response.data?.producer
                        ? response.data["producer"]
                        : null,
                    release_date: response.data?.release_date
                        ? response.data["release_date"]
                        : null,
                    characters: response.data?.characters
                        ? response.data["characters"]
                        : [],
                    planets: response.data?.planets
                        ? response.data["planets"]
                        : [],
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
                    url: `${global.API_GATEWAY_URL}/films/${id}`,
                };
                // Put film in table
                await this.dynamo_commander.putItem(film);
                console.log("Success saving film in db");
                return film;
            }
        } catch (error) {
            console.error(`Could not get film from DB ${error}`);
            throw error;
        }
    }

    static async translateFilm(film, language) {
        delete film.schema_name;
        switch (language) {
            case "es_PE":
                return {
                    object_id: film.object_id,
                    titulo: film.title,
                    episodio_id: film.episode_id,
                    apertura: film.opening_crawl,
                    director: film.director,
                    productor: film.producer,
                    fecha_de_estreno: film.release_date,
                    personajes: film.characters,
                    planetas: film.planets,
                    especies: film.species,
                    vehiculos: film.vehicles,
                    naves: film.starships,
                    creado_en: film.created,
                    editado_en: film.edited,
                    url: film.url,
                };
            case "en_US":
                return { ...film };
            default:
                console.warn("Language not supported");
                throw new LanguageNotSupported("Language not supported");
        }
    }
}

module.exports = FilmsDAO;
