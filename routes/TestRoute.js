const RouteManager = require('./RouteManager');
const Service = require('./Service');

class TestRoute extends RouteManager {
    get services() {
        return [
            new Service('GET', '/world', this.helloWorld),
            new Service('POST', '/world', this.helloWorldPost, [this.authenticate])
        ];
    }

    authenticate(req, res, next) {
        console.log('authenticating request...');
        next();
    }

    helloWorld(req, res, next) {
        res.status(200).json({"Hello": "World"})
    }

    helloWorldPost(req, res, next) {
        res.status(200).json({"Hello": "World",
        "Created": this.string})
    }
}
module.exports = TestRoute;