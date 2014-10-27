var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.index;
handle["/hackerspace"] = requestHandlers.hackerspace;
handle["/coffee"] = requestHandlers.coffee;
handle["/office"] = requestHandlers.office;

server.start(handle, router.route);
