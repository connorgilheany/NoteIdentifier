/*
 * This route management pattern is loosely based off of this HN article:
 * https://hackernoon.com/object-oriented-routing-in-nodejs-and-express-71cb1baed9f0
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
            console.log(`Registering ${service.method.toUpperCase()} ${path}`);
            this.app[service.method](path, service.handler.bind(this))
        });
    }
}

module.exports = RouteManager;