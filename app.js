#!/usr/bin/env node
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const debug = require('debug')('notiwire');
const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const log4js = require("log4js");
const path = require('path');
const nunjucks = require('nunjucks');


const api = require('./routes/api');
const docs = require('./routes/docs');
const notipi = require('./routes/notipi');

// Logging
log4js.configure(__dirname + "/logging.json");
const logger = log4js.getLogger();

const app = express();
// MongoDB
const db = require('monk')('localhost/notiwire');
// WebSockets
const server = http.Server(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
    console.log("Client connected.");

    socket.on('disconnect', () => {
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
app.use((req, res, next) => {
   req.db = db;
   req.io = io;
   next();
});


app.use('/', docs);
app.use('/api', api);
app.use('/notipi', notipi);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
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
app.use((err, req, res, next) => {
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

server.listen(app.get('port'), () => {
  debug('Express server listening on port ' + server.address().port);
});
