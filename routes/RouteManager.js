/*
 * This route management pattern is loosely based off of this HN article:
 * https://hackernoon.com/object-oriented-routing-in-nodejs-and-express-71cb1baed9f0
 */

class RouteManager {

    constructor(app, baseRoute, services) {
        if(!app) {
            throw new Error(`No app in RouteManager for ${baseRoute}`);
        }
        this.app = app;
        this.baseRoute = baseRoute;
        this.registerServices(services);
    }

    /*
     * parameter 'services' is an array of Service objects
     */
    registerServices(services) {
        services.forEach(service => {
            let path = this.baseRoute + service.route;
            this.app[service.method](path, service.handler)
        });
    }
}