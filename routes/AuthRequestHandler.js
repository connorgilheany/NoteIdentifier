const RouteManager = require('./RouteManager');
const Service = require('./Service');
const uuid = require('uuid/v4');
const strings = require('../strings');
const endpoints = require('../secrets/endpoints');

const AuthManager = require('../AuthManager');

class AuthRequestHandler extends RouteManager {
    get services() {
        return [
            new Service('POST', '/login', this.login),
            new Service('POST', '/register', this.register),
            new Service('POSt', '/logout', this.logout),
            new Service('GET', '/test', this.test)
        ];
    }

    test(req, res, next) {
        let userID = req.app.locals.user ? req.app.locals.user : uuid();
        let JWT = AuthManager.createJWT(userID);
        res.status(200).json(JWT);
    }

    login(req, res, next) {
        /*
         Get the hash and salt from the database
         Do the hashing for the inputted password + salt
         if they're the same:
            set a cookie with the auth JWT
         else:
            401
         */

    }

    logout(req, res, next) {
        /*
          Remove their cookie
         */
        res.clearCookie(strings.cookie_name);
        res.status(204).send();
    }

    register(req, res, next){
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
        let userID = req.app.locals.user ? req.app.locals.user : uuid();
        let JWT = AuthManager.createJWT(userID);

    }


}
module.exports = AuthRequestHandler;