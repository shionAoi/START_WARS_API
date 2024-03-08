const {
    GetCommand,
    QueryCommand,
    PutCommand,
    ScanCommand,
    Select,
} = require("@aws-sdk/lib-dynamodb");
const axios = require("axios");

const { URL_SWAPI } = require("./config.js");

class ConsultsDynamoDB {
    constructor(db_client, schema, table) {
        this.db_client = db_client;
        this.schema = schema;
        this.table_name = table;
    }

    async getTotalNumberItems() {
        console.log(`Get total number of items in ${this.schema} schema`);
        try {
            let totalCount = 0;
            let lastEvaluatedKey;

            do {
                try {
                    const command = new ScanCommand({
                        TableName: this.table_name,
                        ExclusiveStartKey: lastEvaluatedKey,
                        FilterExpression: "schema_name = :schema_name",
                        ExpressionAttributeValues: {
                            ":schema_name": this.schema,
                        },
                        Select: "COUNT",
                    });
                    const { Count, LastEvaluatedKey } =
                        await this.db_client.send(command);

                    totalCount += Count;
                    lastEvaluatedKey = LastEvaluatedKey;
                } catch (error) {
                    console.error("Unable to scan the table:", error);
                    throw error;
                }
            } while (lastEvaluatedKey);

            return totalCount;
        } catch (error) {
            console.error(
                `Could not get total number of ${this.schema} from DB. ${error}`
            );
            throw error;
        }
    }

    async getAllItems(startKey, limit) {
        console.log(
            `Get the ${limit} items next to ${startKey} from ${this.schema} in DB`
        );
        let result, lastKey;
        let accumulated = [];
        // Set params to consult next pagination
        const params = {
            TableName: this.table_name,
            ExclusiveStartKey: startKey
                ? {
                      schema_name: this.schema,
                      object_id: startKey,
                  }
                : startKey,
            Limit: limit,
            ConsistentRead: true,
            KeyConditionExpression: "schema_name = :schema_name",
            ExpressionAttributeValues: {
                ":schema_name": this.schema,
            },
        };
        try {
            // Get next elements from lastKey
            result = await this.db_client.send(new QueryCommand(params));
            // Get last key of elements
            const resultQuery2 = await this.db_client.send(
                new QueryCommand({
                    TableName: this.table_name,
                    Limit: 1,
                    ScanIndexForward: false,
                    KeyConditionExpression: "schema_name = :schema_name",
                    ExpressionAttributeValues: {
                        ":schema_name": this.schema,
                    },
                })
            );
            // Validate if last item of pagination is the last item
            lastKey = result.LastEvaluatedKey?.object_id
                ? result.LastEvaluatedKey.object_id
                : null;
            if (result.LastEvaluatedKey?.object_id === resultQuery2.LastEvaluatedKey?.object_id) {
                lastKey = null;
            }
            accumulated = [...accumulated, ...result.Items];
            // Return elements
            return {
                accumulated,
                lastKey,
            };
        } catch (error) {
            console.error(
                `Could not get pagination of ${this.schema} from DB. ${error}`
            );
            throw error;
        }
    }

    async getItemById(id) {
        console.log(`Getting item with id ${id} from ${this.schema} in DB`);
        const params = new GetCommand({
            TableName: this.table_name,
            Key: {
                schema_name: this.schema,
                object_id: `${id}`,
            },
        });
        try {
            // Search in database
            const { Item } = await this.db_client.send(params);
            return Item;
        } catch (error) {
            console.error(`Could not get item from DB ${error}`);
            throw error;
        }
    }

    async putItem(item) {
        console.log(`Putting item in schema ${this.schema}`);
        try {
            const command = new PutCommand({
                TableName: this.table_name,
                Item: item,
            });
            await this.db_client.send(command);
        } catch (error) {
            console.error(`Could not put item in DB ${error}`);
            throw error;
        }
    }
}

module.exports = ConsultsDynamoDB;
