
/*
 * The Service class is utilized by RouteBase and all classes that extend it.
 * There is one Service for each URI
 */
class Service {

    /*
     * method: The http method that this Service handles. GET, POST, PUT, etc
     * route: The URI path that this Service handles. The route is appended to the baseRoute of the RouteManager that creates this service
     * middleware: An array of middleware to apply before handling this Service call
     * handler: The function that handles this Service call.
     */
    constructor(method, route, handler, middleware=[]) {
        this.method = method.toLowerCase();
        this.route = route;
        this.middleware = middleware;
        this.handler = handler;
    }
}
module.exports = Service;