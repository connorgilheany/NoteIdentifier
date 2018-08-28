const RouteManager = require('./RouteManager');
const Service = require('./Service');
const uuid = require('uuid/v4');
const OptionsDatabaseManager = require('../Managers/OptionsDatabaseManager');
const SequenceHistoryDatabaseManager = require('../Managers/SequenceHistoryDatabaseManager');
const UserResultsDatabaseManager = require('../Managers/UserResultsDatabaseManager');
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
            console.log(analysis);
            res.status(200).json(analysis.results);
            res.locals.sent = true;
            //Send statistics to database,
            //remove sequence from database
            SequenceHistoryDatabaseManager.removeSequenceFromDatabase(sequenceID);
            UserResultsDatabaseManager.sendResults(req.app.locals.user, analysis.wronglyGuessedNotes, analysis.correctlyGuessedNotes);

            //increment counters in userResults table
            //return which notes are correct/incorrect, along with the users total results for those notes
        } catch(err) {
            if(err === 'wrong-length') {
                res.status(400).json({err: "Incorrect note guess length. The amount of notes you guessed was not equal to the amount of notes we sent."});
            } else if(err === 'wrong-user') {
                res.status(401).json({err: "Attempted to solve a sequence that we did not serve you."});
            } else {
                console.error(err);
                if(!res.locals.sent) { //make sure we're not double sending responses because of errors that occur after the 200
                    res.status(500).json(err);
                }
            }

        }
    }
    compareGuessesToReality(guessed, real) {
        let pairs = guessed.map((guessed, index) => [guessed, real[index]]);
        let results = [];
        let wronglyGuessedNotes = {};
        let correctlyGuessedNotes = {};
        pairs.forEach(pair => {
            let isCorrect = pair[0] === pair[1];
            results.push({
                guessed: pair[0],
                actual: pair[1],
                isCorrect: isCorrect
            });
            let dictionaryToAppend = isCorrect ? correctlyGuessedNotes : wronglyGuessedNotes;
            dictionaryToAppend[pair[1]] = dictionaryToAppend[pair[1]] ? dictionaryToAppend[pair[1]] + 1 : 1;

        });
        return {
            results: results,
            correctlyGuessedNotes: correctlyGuessedNotes,
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
        return Object.keys(options.notes).filter(x => options.notes[x]);
    }

}
module.exports = NoteRequestHandler;