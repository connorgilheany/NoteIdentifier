const AWS = require('aws-sdk');
const awsConfig = require('./secrets/AWSConfig');
const strings = require('./strings');

AWS.config.update(awsConfig);

const documentClient = new AWS.DynamoDB.DocumentClient();
const table = strings.database.tableName;


function getHashAndSaltForUsername(username) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: table,
            Key: {
                "username": username
            }
        };
        documentClient.scan(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(err);
            } else {
                let userData = data.Items[0];
                return resolve(userData);
            }
        });
    });
}

function 



module.exports = {
    getHashAndSaltForUsername
};