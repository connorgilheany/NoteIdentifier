const RouteManager = require('./RouteManager');
const Service = require('./Service');
const uuid = require('uuid/v4');

class AuthRequestHandler extends RouteManager {
    get services() {
        return [
            new Service('GET', '/new', this.newCookie)
        ];
    }

    newCookie(req, res, next) {
        let id = uuid();
        res.cookie('id', )
    }

    getNotesToChooseFrom(req) {
        if(req.app.locals.user) {

        }

    }

}
module.exports = AuthRequestHandler;