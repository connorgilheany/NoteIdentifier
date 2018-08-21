
/*
 * The Service class is utilized by RouteBase and all classes that extend it.
 * There is one Service for each URI
 */
class Service {

    /*
     * route: The URI path that this Service handles. The route is appended to the baseRoute of the RouteManager that creates this service
     * method: The http method that this Service handles. GET, POST, PUT, etc
     * middleware: An array of middleware to apply before handling this Service call
     * handler: The function that handles this Service call.
     */
    constructor(route, method, middleware, handler) {
        this.route = route;
        this.method = method;
        this.middleware = middleware;
        this.handler = handler;
    }
}