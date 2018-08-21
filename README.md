# NodeSeedProject

A minimal seed project for RESTful APIs in Node. 

This seed project is based on express-generator. The view engine and associated files have been removed, as this is intended for projects that serve JSON.

## Route Management

The main feature of this seed project is it's route management system. The main components of this system are the RouteManager and Service classes

### RouteManager

Routes with the same base path are grouped by within a subclass of RouteManager. These RouteManagers must be registered via the registerRoute function in app.js.
In your RouteManager subclass, you must override the 'get services()' function. This should return an array of Service objects (described below). 

See '/routes/TestRoute.js' for an example.

### Service

Each specific request endpoint & method is represented by a Service object. These Service objects must be returned in the 'services' computed property of their RouteManager.

Each Service object has 4 fields: method, route, handler, and middleware. 

     * method: The http method that this Service handles. GET, POST, PUT, etc
     
     * route: The URI path that this Service handles. The route is appended to the baseRoute of the RouteManager that creates this service
     
     * handler: The function that handles this Service call.
     
     * middleware: An array of middleware to apply before handling this Service call

See the 'services' computed property of '/routes/TestRoute.js' for an example.




## License

This project was intended for personal use. However, if you'd like to use it for some reason, it's under the MIT license. 
