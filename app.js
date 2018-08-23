const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const util = require('util');
const uuid = require('uuid/v4');
const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(displayCookie); //FIXME temporary

app.use(getUserIDfromCookie); //Get user ID first so that we can use it in the registration
//login request handle
//auth request handle
registerRoute('AuthRequestHandler', '/auth');
//no cookie
app.use(addCookieIfNeeded);
//everything else
registerRoute('TestRoute', '/hello');
registerRoute('NoteRequestHandler', '/note');


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

function addCookieIfNeeded(req, res, next) {
    if(!req.cookies.ni_auth) {
        req.app.locals.user = uuid();
        console.log(`Adding cookie for user: ${req.app.locals.user}`);
        res.cookie('ni_auth', req.app.locals.user);
        //TODO: make cookie a JWT instead of a string
    }
    next();
}

function getUserIDfromCookie(req, res, next) {
    if(req.cookies.ni_auth) {
        console.log(`Cookie present! User ID: ${req.cookies.ni_auth}`);
        req.app.locals.user = req.cookies.ni_auth;
    }
    next();
}


function displayCookie(req, res, next) {
    console.log(`Cookies: ${util.inspect(req.cookies)}`);
    next();
}

