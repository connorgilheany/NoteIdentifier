const RouteManager = require('./RouteManager');
const Service = require('./Service');
const uuid = require('uuid/v4');
const OptionsDatabaseManager = require('../Managers/OptionsDatabaseManager');
const SequenceHistoryDatabaseManager = require('../Managers/SequenceHistoryDatabaseManager');
// const UserResultsDatabaseManager = require('../Managers')
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
            await SequenceHistoryDatabaseManager.saveSequenceToDatabase(id, notes, req.app.locals.user);
            res.status(200).json(response);
        } catch(err) {
            console.error(err);
            res.status(500).json(err);
        }
    }

    async guess(req, res, next) {
        try {
            let notesGuessed = req.body.notes;
            let sequenceID   = req.body.sequenceID;
            let sequenceInfo = await SequenceHistoryDatabaseManager.getSequenceNotes(sequenceID);
            this.validateSequenceGuess(notesGuessed, sequenceInfo.notes, req.app.locals.user, sequenceInfo.userID);
            let analysis = this.compareGuessesToReality(notesGuessed, sequenceInfo.notes);
            //Send statistics to database,
            //remove sequence from database
            res.status(200).json(analysis.results);
            //increment counters in userResults table
            //return which notes are correct/incorrect, along with the users total results for those notes
        } catch(err) {
            if(err === 'wrong-length') {
                res.status(400).json({err: "Incorrect note guess length. The amount of notes you guessed was not equal to the amount of notes we sent."});
            } else if(err === 'wrong-user') {
                res.status(401).json({err: "Attempted to solve a sequence that we did not serve you."});
            } else {
                res.status(500).json(err);
            }

        }
    }
    compareGuessesToReality(guessed, real) {
        let pairs = guessed.map((guessed, index) => [guessed, real[index]]);
        let results = [];
        let wronglyGuessedNotes = {};
        pairs.forEach(pair => {
            let isCorrect = pair[0] === pair[1];
            results.push({
                guessed: pair[0],
                actual: pair[1],
                isCorrect: isCorrect
            });
            if(!isCorrect) {
                wronglyGuessedNotes[pair[1]] = wronglyGuessedNotes[pair[1]] ? wronglyGuessedNotes[pair[1]] + 1 : 1;
            }
        });
        return {
            results: results,
            wronglyGuessedNotes: wronglyGuessedNotes
        }
    }

    validateSequenceGuess(guessedNotes, realNotes, guessedUser, realUser) {
        if(guessedNotes.length !== realNotes.length) {
            throw 'wrong-length';
        }
        if(guessedUser !== realUser) {
            throw 'wrong-user';
        }
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