var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.index;
handle["/hackerspace"] = requestHandlers.hackerspace;
handle["/coffee"] = requestHandlers.coffee;
handle["/office"] = requestHandlers.office;
handle["/meetings"] = requestHandlers.meetings;

server.start(handle, router.route);
