const RouteManager = require('./RouteManager');
const Service = require('./Service');
const uuid = require('uuid/v4');
const OptionsDatabaseManager = require('../Managers/OptionsDatabaseManager');
const links = require('../secrets/linksToServe');

class NoteRequestHandler extends RouteManager {
    get services() {
        return [
            new Service('GET', '/sequence', this.noteSequence, [this.checkAuth]),
            new Service('POST', '/guess', this.guess, [this.checkAuth])
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

    async noteSequence(req, res, next) {
        try {
            let numberOfNotes = req.query.size ? Number(req.query.size) : 1;
            let id = uuid();
            let noteOptions = await this.getNotesToChooseFrom(req.app.locals.user);
            let notes = this.getNoteList(numberOfNotes, noteOptions);
            let noteLinks = this.turnNotesIntoLinks(notes);
            let response = {
                sequenceID: id,
                notes: noteLinks
            };
            //store the sequence (id and notes, not links) in the sequenceHistory table
            res.status(200).json(response);
        } catch(err) {
            console.error(err);
            res.status(500).json(err);
        }
    }

    guess(req, res, next) {
        //get note guesses from body
        let notesGuessed = req.body.notes;
        //check sequenceHistory table to see which notes are correct
        
        //increment counters in userResults table
        //return which notes are correct/incorrect, along with the users total results for those notes
        next();
    }

    getNoteList(length, notesToChooseFrom) {
        // let notes = Array(numberOfNotes).fill(this.generateNote(noteOptions));
        // The above only calls generateNote once, and fills the entire array with the same value
        let notes = Array(length);
        for(let i = 0; i < notes.length; i++) {
            notes[i] = this.generateNote(notesToChooseFrom);
        }
        return notes;
    }

    generateNote(fromList) {
        return fromList[Math.floor(Math.random()*fromList.length)];
    }

    turnNotesIntoLinks(notes) {
        return notes.map(x => links.endpoint.split('${note}').join(x))
    }

    async getNotesToChooseFrom(user) {
        if(!user) {
            throw 'no-user';
        }
        let options = await OptionsDatabaseManager.getUserOptionsFromDatabase(user);
        let notesToPlay = Object.keys(options.notes).filter(x => options.notes[x]);
        return notesToPlay;
    }

}
module.exports = NoteRequestHandler;