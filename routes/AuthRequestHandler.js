const uuid = require('uuid/v4');
const hmacSHA256 = require('crypto-js/hmac-sha256');
const csprng = require('csprng');

const RouteManager = require('./RouteManager');
const Service = require('./Service');
const CookieManager = require('../Managers/CookieManager');
const DatabaseManager = require('../Managers/LoginDatabaseManager');

const strings = require('../strings');
const secrets = require('../secrets/hash');



class AuthRequestHandler extends RouteManager {
    get services() {
        return [
            new Service('POST', '/login', this.login),
            new Service('POST', '/register', this.register),
            new Service('POST', '/logout', this.logout)
        ];
    }

    async login(req, res, next) {
        /*
         Get the hash and salt from the database
         Do the hashing for the inputted password + salt
         if they're the same:
            set a cookie with the auth JWT
         else:
            401
         */
        try {
            let username = req.body.username;
            let password = req.body.password;
            let userData = await DatabaseManager.getUserInfoFromDatabase(username);
            let salt = userData.salt;
            if(userData.passHash === saltAndHashPassword(salt, password)) {
                CookieManager.addCookieWithID(res, userData.userID);
                res.status(200).send();
            } else {
                throw 'bad-pass';
            }
        } catch(err) {
            if(err === 'no-user' || err === 'bad-pass') {
                res.status(401).send();
                return;
            }
            res.status(500).send();
        }
    }

    logout(req, res, next) {
        /*
          Remove their cookie
         */
        CookieManager.removeCookie(res);
        res.status(204).send();
    }

    async register(req, res, next){
        /*
        if the user has a cookie,
            take the ID from the cookie
        else:
            make random ID

        check the database to see if their username is in use already
        If it is:
            400
        Generate a salt
        Hash the password +salt
        Store them in database
        Set a cookie with the auth JWT
         */
        try {
            let userID = req.app.locals.user ? req.app.locals.user : uuid();
            let username = req.body.username;
            console.log(`Attempting to register ${username}`);
            let password = req.body.password;
            let salt = generateSalt();
            let hashedAndSalted = saltAndHashPassword(salt, password);
            await DatabaseManager.createUser(username, hashedAndSalted, salt, userID);
            res.status(200).json({message: `Successfully registered user ${username}`});
            console.log(`Successfully registered ${username}`);
        } catch(err) {
            if(err === 'already-registered') {
                console.log(`${username} was already registered`);
                res.status(400).json({"err": "User already registered"}); //TODO make a centralized error management system
                return;
            }
            console.error(err);
            res.status(500).send();
        }
    }
}
module.exports = AuthRequestHandler;

function saltAndHashPassword(salt, password) {
    let passSecret = secrets.passHashSecret;
    let saltedPassword = `${password}${salt}`;
    return hmacSHA256(saltedPassword, passSecret).toString();
}

function generateSalt() {
    return csprng(256, 36);
}