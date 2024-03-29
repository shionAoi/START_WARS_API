const { LanguageNotSupported } = require("../utils/errors.js");
const axios = require("axios");

const { URL_SWAPI, STAR_WARS_TABLE_DB } = require("../utils/config.js");
const ConsultsDynamoDB = require("../utils/dynamodb.client.js");
const ConsultsAxios = require("../utils/axios.client.js");

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
                console.log("Film found in DB");
                return item;
            } else {
                console.log("Getting film from API. Not in database");
                // If not in database consult to api star wars
                const object_swapi = await ConsultsAxios.getCommand(`${URL_SWAPI}/films/${id}`);
                // Translate result to put it in db
                const film = {
                    schema_name: "films",
                    object_id: `${id}`,
                    title: object_swapi?.title ? object_swapi["title"] : null,
                    episode_id: object_swapi?.episode_id
                        ? object_swapi["episode_id"]
                        : null,
                    opening_crawl: object_swapi?.opening_crawl
                        ? object_swapi["opening_crawl"]
                        : null,
                    director: object_swapi?.director
                        ? object_swapi["director"]
                        : null,
                    producer: object_swapi?.producer
                        ? object_swapi["producer"]
                        : null,
                    release_date: object_swapi?.release_date
                        ? object_swapi["release_date"]
                        : null,
                    characters: object_swapi?.characters
                        ? object_swapi["characters"]
                        : [],
                    planets: object_swapi?.planets
                        ? object_swapi["planets"]
                        : [],
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
