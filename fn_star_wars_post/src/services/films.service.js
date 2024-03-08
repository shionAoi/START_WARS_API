const FilmsDAO = require("../models/films.model");
const { DEFAULT_PAGINATION_ITEMS } = require("../utils/config");

class FilmsService {
    constructor(db_client, language) {
        this.films_dao = new FilmsDAO(db_client);
        this.language = language;
    }

    async processFilm(film_id) {
        try {
            const film = await this.films_dao.getFilmById(film_id);
            const translated = await FilmsDAO.translateFilm(
                film,
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
            console.error(`Could not get film. ${error}`);
            throw error;
        }
    }

    async processFilms(key) {
        let results = [];
        let success = "false";
        try {
            const { accumulated, lastKey, count } =
                await this.films_dao.getAllFilms(
                    key,
                    DEFAULT_PAGINATION_ITEMS
                );
            if (accumulated && accumulated.length > 0) {
                await Promise.all(
                    accumulated.map(async (item) => {
                        try {
                            const aux = await FilmsDAO.translateFilm(
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
                success = "true"
            }
            return {
                success,
                response: {
                    films: results,
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
            console.error(`Could not get list of films. ${error}`);
            throw error;
        }
    }
}

module.exports = FilmsService;
