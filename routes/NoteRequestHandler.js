const RouteManager = require('./RouteManager');
const Service = require('./Service');
const uuid = require('uuid/v4');
const OptionsDatabaseManager = require('../Managers/OptionsDatabaseManager');

class NoteRequestHandler extends RouteManager {
    get services() {
        return [
            new Service('GET', '/sequence', this.noteSequence, [this.checkAuth])
        ];
    }

    checkAuth(req, res, next) {
        console.log('Checking authentication...');
        if(req.app.locals.user) {
            req.app.locals.shouldBeLogged = true;
            console.log('This request was made by an authenticated user. The results will be logged.');
        }
        next();
    }

    noteSequence(req, res, next) {
        let numberOfNotes = req.query.size ? Number(req.query.size) : 1;
        let id = uuid();
        let noteOptions = this.getNotesToChooseFrom(req.app.locals.user);
        let notes = Array(numberOfNotes).fill(this.generateNote(noteOptions));
        let response = {
            id: id,
            notes: notes
        };
        res.status(200).json(response);
    }

    generateNote(fromList) {
        return 1;
    }

    getNotesToChooseFrom(user) {
        if(user) {

        }

    }

}
module.exports = NoteRequestHandler;