/*
 * This route management pattern is loosely based off of this HN article:
 * https://hackernoon.com/object-oriented-routing-in-nodejs-and-express-71cb1baed9f0
 * Instead of using a poorly constructed dictionary, I created the Service class.
 * I also added a way to add pre-handler and post-handler middleware
 */

class RouteManager {

    constructor(app, baseRoute) {
        if(!app) {
            throw new Error(`No app in RouteManager for ${baseRoute}`);
        }
        this.app = app;
        this.baseRoute = baseRoute;
        this.registerServices(this.services);
    }

    /*
     * This method must be overridden in subclasses.
     * Return an array of Service objects
     */
    get services() {
        return {};
    }

    registerServices() {
        this.services.forEach(service => {
            let path = this.baseRoute + service.route;
            console.log(`Registering\t${service.method.toUpperCase()}\t${path}`);
            let boundMiddleware = service.middleware.map(x => x.bind(this));
            this.app[service.method](path, boundMiddleware, service.handler.bind(this))
        });
    }
}

module.exports = RouteManager;