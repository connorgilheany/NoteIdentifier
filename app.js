let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let util = require('util');
let app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(authenticateUser);


registerRoute('TestRoute', '/hello');
registerRoute('NoteRequestHandler', '/note');
registerRoute('CookieRequestHandler', '/cookie');


registerRoutes();


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    console.error(err);

    // render the error page
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    })
});

module.exports = app;

function registerRoute(managerPath, route) {
    let routeManager = require(`./routes/${managerPath}`);
    new routeManager(app, route);
}

function authenticateUser(req, res, next) {
    console.log(`Cookies: ${util.inspect(req.cookies)}`);
    if(req.headers.authorization) {
        req.app.locals.user = req.headers.authorization;
    }
    next();
}

