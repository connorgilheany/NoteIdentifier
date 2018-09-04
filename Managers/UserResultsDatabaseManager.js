const AWS = require('aws-sdk');
const awsConfig = require('../secrets/AWSConfig');
const strings = require('../strings');

AWS.config.update(awsConfig);

const documentClient = new AWS.DynamoDB.DocumentClient();
const table = strings.database.userResultsTableName;

async function sendResults(userID, wrong, right) {
    try {
        await addUserToDBIfNecessary(userID);
        let builtUpdateExpression = buildUpdateExpression(wrong, right);
        const params = {
            TableName: table,
            Key: {
                userID: userID
            },
            UpdateExpression: builtUpdateExpression.UpdateExpression,
            ExpressionAttributeValues: builtUpdateExpression.ExpressionAttributeValues,
            ReturnValues:"UPDATED_NEW"
        };

        documentClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            }
        });
    } catch(err) {
        console.err('Couldnt add user to userResults table');
        console.err(err);
    }
}

function buildUpdateExpression(wrong, right) {
    let UpdateExpression = "SET ";
    let ExpressionAttributeValues = {":zero": 0};
    //The following is not very DRY, so I'll revisit it ^(TM)
    for(note in wrong) {
        UpdateExpression = `${UpdateExpression}info.incorrect.${note} = if_not_exists(info.incorrect.${note}, :zero) + :wrong${note}, `;
        ExpressionAttributeValues[`:wrong${note}`] = wrong[note];

    }
    for(note in right) {
        UpdateExpression = `${UpdateExpression}info.correct.${note} = if_not_exists(info.correct.${note}, :zero) + :right${note}, `;
        ExpressionAttributeValues[`:right${note}`] = right[note];
    }
    return {
        UpdateExpression: UpdateExpression.slice(0, -2),
        ExpressionAttributeValues: ExpressionAttributeValues
    }
}

async function addUserToDBIfNecessary(userID) {
    let isInDB = await checkIfUserIsInDB(userID);
    if(isInDB) {
        console.log('User was found in DB');
        return;
    }
    await addUserToDB(userID);
}
function checkIfUserIsInDB(userID) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: table,
            Key:{
                userID: userID
            }
        };

        documentClient.get(params, (err, data) => {
            if(err || !data.Item) {
                //dont need to add user
                console.log('Error trying to get user from DB');
                return resolve(false);
            } else {
                console.log(`User found in DB: ${JSON.stringify(data)}`);
                return resolve(true);
            }
        });
    });
}

function addUserToDB(userID) {
    return new Promise((resolve, reject) => {
        console.log('adding user to DB');
        const params2 = {
            TableName: table,
            Item: {
                userID: userID,
                info: {
                    correct: {},
                    incorrect: {}
                }
            }
        };
        documentClient.put(params2, (err, data) => {
            if (err) {
                console.error("Unable to add user to UserResults table. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("Added user to UserResults table:", JSON.stringify(data, null, 2));
                resolve(params2.Item);
            }
        });
    });
}

module.exports = {
    sendResults
};