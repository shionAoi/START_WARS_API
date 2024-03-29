const URL_SWAPI = process.env.URL_SWAPI;
const DYNAMO_REGION = process.env.DYNAMO_REGION;
global.API_GATEWAY_URL = process.env.API_GATEWAY_URL;
const DEFAULT_PAGINATION_ITEMS = process.env.DEFAULT_PAGINATION_ITEMS || "20";
const AXIOS_DEFAULT_TIME = process.env.AXIOS_DEFAULT_TIME
    ? parseInt(process.env.AXIOS_DEFAULT_TIME)
    : 5000;

const STAR_WARS_TABLE_DB = process.env.STAR_WARS_TABLE_DB;

module.exports = {
    URL_SWAPI,
    DYNAMO_REGION,
    STAR_WARS_TABLE_DB,
    DEFAULT_PAGINATION_ITEMS,
    AXIOS_DEFAULT_TIME
};
