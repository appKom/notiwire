var coffee = {}
var office = {}
var hackerspace = undefined
var meeting = {}
var cantina = {}
var servants = {}

var affiliation = require("./affiliation.js");
var cantinas = require("./cantina.js");
var offices = require("./office.js");

function init(){
	for (var name in affiliation.org){
		if (affiliation.org[name].hw !== undefined){
			coffee[name] = undefined;
			office[name] = undefined;
			meeting[name] = undefined;
			servants[name] = undefined;
		}
	}
	for (var name in cantinas){
		cantina[name] = undefined;
	}
}
var stuff = function(){
	for (var name in office){
		stuff2(name);
	}
}
var stuff2 = function(name){
	offices.get(name, function(status, message){
		office[name] = message + "  " + status;
		console.log(name + ": " + message + "  " + status);
	});
}

init()

setInterval(function(){stuff()}, 10000);