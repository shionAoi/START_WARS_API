const { URL_SWAPI } = require("../utils/config.js");
const { LanguageNotSupported } = require("../utils/errors.js");
const ConsultsAxios = require("../utils/axios.client.js");

class RootDAO {
    constructor(language) {
        this.language = language;
    }

    async getRoot() {
        try {
            console.log("Get default routes from star wars api");
            const response = await ConsultsAxios.getCommand(URL_SWAPI);
            let premise;
            switch (this.language) {
                case "es_PE":
                    premise = {
                        personas: `${global.API_GATEWAY_URL}/people`,
                        planetas: `${global.API_GATEWAY_URL}/planets`,
                        peliculas: `${global.API_GATEWAY_URL}/films`,
                        especies: `${global.API_GATEWAY_URL}/species`,
                        vehiculos: `${global.API_GATEWAY_URL}/vehicles`,
                        naves: `${global.API_GATEWAY_URL}/starships`,
                    };
                    break;
                case "en_US":
                    premise = {
                        people: `${global.API_GATEWAY_URL}/people`,
                        planets: `${global.API_GATEWAY_URL}/planets`,
                        films: `${global.API_GATEWAY_URL}/films`,
                        species: `${global.API_GATEWAY_URL}/species`,
                        vehicles: `${global.API_GATEWAY_URL}/vehicles`,
                        starship: `${global.API_GATEWAY_URL}/starships`,
                    };
                    break;
                default:
                    console.warn("Language not supported");
                    throw new LanguageNotSupported("Language not supported");
            }
            return {
                premise,
                from_api: { ...response },
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = RootDAO;
