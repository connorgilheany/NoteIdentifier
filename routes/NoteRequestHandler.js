const RouteManager = require('./RouteManager');
const Service = require('./Service');
const uuid = require('uuid/v4');

class NoteRequestHandler extends RouteManager {
    get services() {
        return [
            new Service('GET', '/sequence', this.noteSequence, [this.checkAuth])
        ];
    }

    checkAuth(req, res, next) {
        if(req.locals.user) {
            req.locals.shouldBeLogged = true;
            console.log('This request was made by an authenticated user. The results will be logged.');
        }
    }

    noteSequence(req, res, next) {
        let numberOfNotes = req.params.size ? req.params.size : 1;
        let id = uuid();

    }

    generateNote() {

    }

}
module.exports = NoteRequestHandler;