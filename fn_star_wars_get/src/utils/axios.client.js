const { default: axios } = require("axios");
const { AXIOS_DEFAULT_TIME } = require("./config");
const { ResourceNotFoundExternalService } = require("./errors");

class ConsultsAxios {
    static async getCommand(path) {
        try {
            const response = await axios.get(path, {
                timeout: AXIOS_DEFAULT_TIME,
                validateStatus: (status) => {
                    return status === 200;
                },
            });
            if (!response?.data) {
                throw new Error('Status 200 but empty response')
            }
            console.log(`Result from external consult: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            if (error?.response?.status && error.response.status === 404) {
                console.warn(`Resource not found in ${path}`);
                throw new ResourceNotFoundExternalService("Item not found");
            }
            log.error(`Axios failed with error. ${error}`);
            throw new Error("Axios failed");
        }
    }
}

module.exports = ConsultsAxios
