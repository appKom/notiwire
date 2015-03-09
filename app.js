var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var log4js = require("log4js");

var api = require('./routes/api');
var docs = require('./routes/docs');
var notipi = require('./routes/notipi');
var db = require('monk')('localhost/notiwire');

// Logging
log4js.configure(__dirname + "/logging.json");

var app = express();


// view engine setup
nunjucks.configure('views', {
    autoescape: true,
    express: app
});
// app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));


// Access to db in routes
app.use(function (req, res, next) {
   req.db = db;
   next();
});


app.use('/', docs);
app.use('/api', api);
app.use('/notipi', notipi);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        logger.info(err);
        res.status(err.status || 500);
        res.json({
            message: err.message,
            status: err.status,
            stack: err.stack
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    logger.error(err);
    res.status(err.status || 500);
    res.json({'error': {
        'message': err.message,
        'status': err.status
    }});
});


module.exports = app;
