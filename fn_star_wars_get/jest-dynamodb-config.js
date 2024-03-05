module.exports = {
    port: 5001,
    tables: [
        {
            TableName: process.env.STAR_WARS_TABLE_DB,
            AttributeDefinitions: [
                {
                    AttributeName: "schema_name",
                    AttributeType: "S",
                },
                {
                    AttributeName: "object_id",
                    AttributeType: "S",
                },
            ],
            KeySchema: [
                {
                    AttributeName: "schema_name",
                    KeyType: "HASH",
                },
                {
                    AttributeName: "object_id",
                    KeyType: "RANGE",
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            },
        },
    ],
  };