/*
 * This route management pattern  
 *
 */

class RouteBase {

    constructor(app, baseRoute) {
        if(!app) {
            throw new Error(`No app in RouteBase for ${baseRoute}`);
        }
        this.app = app;
        this.baseRoute = baseRoute;
        this.routes = [];
        this.registerServices();
    }
}