const RouteManager = require('./RouteManager');
const Service = require('./Service');
const uuid = require('uuid/v4');
const hmacSHA256 = require('crypto-js/hmac-sha256');
const secretFile = require('../secrets/hash');

class AuthRequestHandler extends RouteManager {
    get services() {
        return [
            new Service('POST', '/login', this.login),
            new Service('POST', '/register', this.register)
        ];
    }

    login(req, res, next) {
        /*
         do the login
         set a cookie with the auth JWT
         */
    }

    register(req, res, next){
        /*
        if the user has a cookie,
            register the user with the id that was present in the cookie
        else
            register the user with a random id
         */
        let userID = req.app.locals.user ? req.app.locals.user : uuid();
        let JWT = this.createJWT(userID);
        
    }

    createJWT(userID) {
        let encodedHeader = this.encodeObject({
            "typ": "JWT",
            "alg": "HS256"
        });
        let encodedPayload = this.encodeObject({
            "userID": userID
        });
        let dataToHash = `${encodedHeader}.${encodedPayload}`;
        let hashedData = this.hash(dataToHash);
        let signature = this.encodeString(hashedData);
        return `${dataToHash}.${signature}`;
    }

    hash(data) {
        let secret = secretFile.hashSecret;
        return hmacSHA256(data, secret);
    }

    encodeObject(obj) {
        return encodeString(JSON.stringify(obj));
    }

    encodeString(string) {
        return btoa(string)
    }
}
module.exports = AuthRequestHandler;