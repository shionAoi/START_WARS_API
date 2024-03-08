const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const ConsultsDynamoDB = require("../../src/utils/consults.dynamo");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { STAR_WARS_TABLE_DB } = require("../../../src/utils/config");

describe("ConsultsDynamoDB", () => {
    let consultsDB;

    beforeAll(() => {
        const testClient = new DynamoDBClient({
            endpoint: "localhost:5001",
            sslEnabled: false,
            region: "us-east-1",
        });
        const dynamoClient = DynamoDBDocumentClient.from(testClient);
        consultsDB = new ConsultsDynamoDB(dynamoClient,"test",STAR_WARS_TABLE_DB);
    });

    test("getTotalNumberItems method", async () => {
        // Call method
        const totalCount = await consultsDB.getTotalNumberItems();
        expect(totalCount).toBe(0);
    },90);

    test("getAllItems method", async () => {
        // Call method
        const { accumulated, lastKey } = await consultsDB.getAllItems(null, 10);

        // Assert
        expect(accumulated).toEqual([]);
        expect(lastKey).toBe(null); 
    });

    test("getItemById method", async () => {
        await consultsDB.putItem({
            "object_id": "test"
        });
        // Call method
        const item = await consultsDB.getItemById("test");

        // Assert
        expect(item).toEqual({"object_id": "test"});
    });
});
