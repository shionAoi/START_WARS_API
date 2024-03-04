const RootDAO = require("../models/root.model.js");
const { URL_SWAPI } = require("../utils/config.js");

class RootService {
    constructor(language) {
        this.root_dao = new RootDAO(language);
        this.language = language;
    }

    async processResponse() {
        try {
            const root = await this.root_dao.getRoot();
            return {
                success: true,
                response: {
                    ...root.premise,
                    meta: {
                        default_language: this.language,
                        data_from: {
                            api: URL_SWAPI,
                            description: "Star Wars API",
                            routes: { ...root.from_api },
                        },
                    },
                },
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = RootService;
