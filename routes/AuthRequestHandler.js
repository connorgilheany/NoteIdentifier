const RouteManager = require('./RouteManager');
const Service = require('./Service');
const uuid = require('uuid/v4');

const AuthManager = require('../AuthManager');

class AuthRequestHandler extends RouteManager {
    get services() {
        return [
            new Service('POST', '/login', this.login),
            new Service('POST', '/register', this.register),
            new Service('GET', '/test', this.test)
        ];
    }

    test(req, res, next) {
        let userID = req.app.locals.user ? req.app.locals.user : uuid();
        let JWT = this.createJWT(userID);
        res.status(200).json(JWT);
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
        let JWT = AuthManager.createJWT(userID);

    }


}
module.exports = AuthRequestHandler;