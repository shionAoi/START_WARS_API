"use strict";
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const express = require("express");
const serverless = require("serverless-http");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const { DYNAMO_REGION } = require("./utils/config.js");
const getRootRoute = require("./routes/root.route.js");
const getPeople = require("./routes/people.route.js");
const getFilms = require("./routes/films.route.js");

let dynamodb_client;

if (typeof dynamodb_client === "undefined") {
    const client = new DynamoDBClient({
        region: DYNAMO_REGION,
        // endpoint: "http://localhost:4566",
    });
    dynamodb_client = DynamoDBDocumentClient.from(client);
}

const app = express();
app.set("db_client", dynamodb_client);
app.use(express.json());

// Set uri of api Gateway
app.use((req, res, next) => {
    if (typeof global.API_GATEWAY_URL === "undefined") {
        // Get the request URI
        const requestUri = `${req.protocol}://${req.get("host")}`;
        // Set it as an environment variable
        global.API_GATEWAY_URL = requestUri;
    }
    if (!req.get("Accept-Language")) {
        app.set("language", "es_PE");
    } else app.set("language", req.get("Accept-Language"));
    next();
});

app.use("/", getRootRoute);
app.use("/people", getPeople);
app.use("/films", getFilms);

app.use((error, req, res, next) => {
    return res.status(500).json({ error: error.message });
});

app.listen(4110, () => {
    console.log(`listening on port ${4110}`);
});

module.exports.handler = serverless(app);
