const AWS = require('aws-sdk');
const awsConfig = require('../secrets/AWSConfig');
const strings = require('../strings');

AWS.config.update(awsConfig);

const documentClient = new AWS.DynamoDB.DocumentClient();
const table = strings.database.optionsTableName;
const defaultOptions = strings.defaultOptions;


function getUserOptionsFromDatabase(userID) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: table,
            Key: {
                userID: userID
            }
        };
        documentClient.get(params, async (err, data) => {
            if (err) {
                console.error("Unable to find item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(err);
            } else {
                if(data.Item) {
                    console.log("Found item:", JSON.stringify(data, null, 2));
                    return resolve(data.Item.info.options);
                }
                //User doesn't have any saved options, so let's save their default options
                let savedOptions = await saveUserOptionsToDatabase(userID, defaultOptions);
                return resolve(savedOptions);
            }
        });
    });
}

function saveUserOptionsToDatabase(userID, options) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: table,
            Item: {
                userID: userID,
                info: {
                    options: options
                }
            }
        };
        documentClient.put(params, (err, data) => {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(err);
            } else {
                console.log("Saved item:", JSON.stringify(data, null, 2));
                return resolve(options);
            }
        });
    });
}

function updateUserOptionsToDatabase(userID, options) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: table,
            Key: {
                userID: userID
            },
            UpdateExpression: "set info.options=:o",
            ExpressionAttributeValues: {
                ":o": options
            },
            ReturnValues:"UPDATED_NEW"
        };
        documentClient.update(params, (err, data) => {
            if (err) {
                console.error("UpdateItem failed. Error JSON:", JSON.stringify(err, null, 2));
                return reject(err);
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                return resolve(data.Attributes.info.options);
            }
        });
    });
}


module.exports = {
    getUserOptionsFromDatabase,
    updateUserOptionsToDatabase
};