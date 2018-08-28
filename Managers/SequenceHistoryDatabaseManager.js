const AWS = require('aws-sdk');
const awsConfig = require('../secrets/AWSConfig');
const strings = require('../strings');

AWS.config.update(awsConfig);

const documentClient = new AWS.DynamoDB.DocumentClient();
const table = strings.database.sequenceHistoryTableName;


function getSequenceNotes(sequenceID) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: table,
            Key: {
                sequenceID: sequenceID
            }
        };
        documentClient.get(params, async (err, data) => {
            if (err) {
                console.error("Unable to find item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(err);
            } else {
                if(data.Item) {
                    // console.log("Found item:", JSON.stringify(data, null, 2));
                    return resolve(data.Item.info);
                }
            }
        });
    });
}

function saveSequenceToDatabase(sequenceID, notes, userID) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: table,
            Item: {
                sequenceID: sequenceID,
                info: {
                    notes: notes,
                    userID: userID
                }
            }
        };
        documentClient.put(params, (err, data) => {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(err);
            } else {
                // console.log("Saved item:", JSON.stringify(data, null, 2));
                return resolve(params.Item);
            }
        });
    });
}

function removeSequenceFromDatabase(sequenceID) {
    //This function should not ever be waited upon, as it's success/failure is not important
   // return new Promise((resolve, reject) => {
        const params = {
            TableName: table,
            Key: {
                sequenceID: sequenceID
            }
        };
        documentClient.delete(params, (err, data) => {
            if (err) {
                console.error("Unable to remove item. Error JSON:", JSON.stringify(err, null, 2));
                //return reject(err);
            } else {
                console.log("Removed item:", JSON.stringify(data, null, 2));
               // return resolve(data);
            }
        });
   // });
}

module.exports = {
    getSequenceNotes,
    saveSequenceToDatabase,
    removeSequenceFromDatabase
};