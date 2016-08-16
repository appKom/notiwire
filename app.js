#!/usr/bin/env node
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var debug = require('debug')('notiwire');
var express = require('express');
var favicon = require('serve-favicon');
var http = require('http');
var log4js = require("log4js");
var path = require('path');
var nunjucks = require('nunjucks');


var api = require('./routes/api');
var docs = require('./routes/docs');
var notipi = require('./routes/notipi');

// Logging
log4js.configure(__dirname + "/logging.json");
var logger = log4js.getLogger();

var app = express();
// MongoDB
var db = require('monk')('localhost/notiwire');
// WebSockets
var io = require('socket.io')(server);
var server = http.Server(app);

io.on('connection', function(socket) {
    console.log("Client connected.");

    socket.on('disconnect', function() {
        console.log("Lost client.");
    });
});


// view engine setup
nunjucks.configure('views', {
    autoescape: true,
    express: app
});
// app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));


// Access to db and websockets in routes
app.use(function (req, res, next) {
   req.db = db;
   req.io = io;
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
    if(err.status !== 404) {
        logger.error(err);
    }
    res.status(err.status || 500);
    res.json({'error': {
        'message': err.message,
        'status': err.status
    }});
});

app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
