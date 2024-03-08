const PeopleDAO = require("../models/people.model");
const { DEFAULT_PAGINATION_ITEMS } = require("../utils/config");

class PeopleService {
    constructor(db_client, language) {
        this.people_dao = new PeopleDAO(db_client);
        this.language = language;
    }

    async processPerson(person_id) {
        try {
            const person = await this.people_dao.getPersonById(person_id);
            const translated = await PeopleDAO.translatePerson(
                person,
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
            console.error(`Could not get person. ${error}`);
            throw error;
        }
    }

    async processPeople(key) {
        let results = [];
        let success = "false";
        try {
            const { accumulated, lastKey, count } =
                await this.people_dao.getAllPeople(
                    key,
                    DEFAULT_PAGINATION_ITEMS
                );
            if (accumulated && accumulated.length > 0) {
                await Promise.all(
                    accumulated.map(async (item) => {
                        try {
                            const aux = await PeopleDAO.translatePerson(
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
                success = "true";
            }
            return {
                success,
                response: {
                    people: results,
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
            console.error(`Could not get list of people. ${error}`);
            throw error;
        }
    }
}

module.exports = PeopleService;
