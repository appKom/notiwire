var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.index;
handle["/cantina"] = requestHandlers.cantina;
handle["/coffee"] = requestHandlers.coffee;
handle["/hackerspace"] = requestHandlers.hackerspace;
handle["/meetings"] = requestHandlers.meetings;
handle["/office"] = requestHandlers.office;

server.start(handle, router.route);
