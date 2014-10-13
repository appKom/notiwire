var coffee = require("./coffee.js");
var cantina = require("./cantina.js");

coffee.get(true, function(text1, text2){
	console.log(text1);
	console.log(text2);
});

cantina.get("realfag", function(text1){
	console.log(text1);
});

