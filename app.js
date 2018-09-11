const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const util = require('util');
const CookieManager = require('./Managers/CookieManager');
const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if(req.method === 'OPTIONS') {
        res.status(204).send();
    } else {
        next();
    }
});

app.use(CookieManager.addCookieIfNeeded);
app.use(CookieManager.getUserIDfromCookie);


registerRoute('OptionsRequestHandler', '/options');
registerRoute('AuthRequestHandler', '/auth');
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
