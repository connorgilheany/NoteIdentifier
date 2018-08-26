const RouteManager = require('./RouteManager');
const Service = require('./Service');
const OptionsDatabaseManager = require('../Managers/OptionsDatabaseManager');

class NoteRequestHandler extends RouteManager {
    get services() {
        return [
            new Service('GET', '/', this.getOptions),
            new Service('POST', '/', this.postOptions)
        ];
    }

    async getOptions(req, res, next) {
        try {
            let options = await OptionsDatabaseManager.getUserOptionsFromDatabase(req.app.locals.user);
            res.status(200).json({options: options});
        } catch(err) {
            console.error(err);
            res.status(500).json(err);
        }
    }

    async postOptions(req, res, next) {
        try {
            let options = await OptionsDatabaseManager.updateUserOptionsToDatabase(res.app.locals.user, req.body.options);
            res.status(200).json({options: options});
        } catch(err) {
            console.error(err);
            res.status(500).json(err);
        }
    }


}
module.exports = NoteRequestHandler;