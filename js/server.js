var http = require("http");
var prompt = require("prompt");
var querystring = require("querystring");
var url = require("url");


var start = function(handle, route) {
	var server = http.createServer(function(request, response){
		var pathname = url.parse(request.url).pathname;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
		route(handle, pathname, response);
	});
	server.listen(8080);
}

function getHelpText(){
	var info = "localhost/info/linjeforening";
	var info1 = "coffee\noffice";
	var info2 = "localhost/hackerspace";
	return info + "\n" + info1 + "\n" + info2;
}

exports.start = start;

// prompt.start();

// prompt.get(["Info", "Affilation"], function(err, res){
// 	officeLight.get(res.Affilation, function(data){
// 		console.log(res.Affilation + " light: " + data);
// 	});
// });


// coffee.get(true, function(text1, text2){
// 	console.log(text1);
// 	console.log(text2);
// });

// cantina.get("realfag", function(text1){
// 	console.log(text1);
// });

