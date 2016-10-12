var express = require('express');
var flash = require('connect-flash');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var settings = require("./settings");

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(flash());
app.use(session({
    secret: settings.cookieSecret,
    cookie: { maxAge: 1000*60*2 },
    store: new MongoStore({
        db: settings.db,
        host: settings.host,
        port: "27017",
        url: "mongodb://localhost:27017/demo"
    })
})); 
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    var error = req.flash('error');
    var success = req.flash('success');
    res.locals.error = error.length ? error : null;
    res.locals.success = success.length ? success : null;

    next();
});

app.get('/', routes);
app.get('/u/:user', routes);
app.post('/post', routes);
app.get('/reg', routes);
app.post('/reg', routes);
app.get('/login', routes);
app.post('/login', routes);
app.get('/logout', routes);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(3000);

module.exports = app;
