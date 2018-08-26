const AWS = require('aws-sdk');
const awsConfig = require('../secrets/AWSConfig');
const strings = require('../strings');

AWS.config.update(awsConfig);

const documentClient = new AWS.DynamoDB.DocumentClient();
const table = strings.database.loginTableName;


async function getUserInfoFromDatabase(username) {
    return await searchForUser(username);
}

async function isUserRegistered(username) {
    //If there's no user in the DB with the given username, searchForUser throws a no-user error.
    //This is what we'll use to determine if a user is registered. However, we must also propagate other errors
    try {
        await searchForUser(username);

        return true;
    } catch(err) {
        if(err === 'no-user') {
            return false;
        } else {
            throw err;
        }
    }
}

/*
    Returns user data if the user is found.
    Throws:
        'no-user' if the user is not found in the database
        Different errors if there's a problem connecting to dynamo or with our query
 */
function searchForUser(username) {
    console.log(`Searching datbabase for ${username}...`);
    return new Promise((resolve, reject) => {
        const params = {
            TableName: table,
            Key: {
                username: username
            }
        };
        documentClient.get(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(err);
            } else {
                if(data.Item) {
                    console.log(`Found results in database: ${JSON.stringify(data.Item)}`);
                    return resolve(data.Item.info)
                }
                return reject('no-user');
            }
        });
    });
}

function createUser(username, hashedAndSalted, salt, userID) {
    return new Promise(async (resolve, reject) => {
        if(await isUserRegistered(username)) {
            return reject('already-registered');
        }
        const params = {
            TableName: table,
            Item: {
                username: username,
                info: {
                    passHash: hashedAndSalted,
                    salt: salt,
                    userID: userID
                }
            }
        };
        documentClient.put(params, (err, data) => {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(err);
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                return resolve(data);
            }
        });
    });
}


module.exports = {
    getUserInfoFromDatabase,
    isUserRegistered,
    createUser
};