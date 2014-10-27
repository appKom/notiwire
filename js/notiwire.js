var coffee = require("./coffee.js");
var cantina = require("./cantina.js");
var office = require("./office.js");
var http = require("http");
var hackerspace = require("./hackerspace.js");
var officeLight = require("./officeLight.js");
var prompt = require("prompt");

var server = http.createServer(function(req, res){
	var urlInfo = req.url.split("/");
	if (urlInfo.length !== 3){
		if (urlInfo.length == 2){
			if (urlInfo[1] == "info" || urlInfo[1] == "help" || urlInfo[1] == ""){
				res.end(getHelpText());
				console.log("inforequest");
			}
			else if (urlInfo[1] == "hackerspace"){
				hackerspace.get(function(isOpen){
					res.end(isOpen);
					console.log("hackerspacerequest");
				});
			}
			else if (urlInfo[1] == "favicon.ico"){
				res.end("No favicon.ico");
				console.log("Favicon requested");
			}

			else{
				res.end("ERROR: Length 2");
				console.log("ERROR: Length 2");
			} 
		}
		else{
			res.end("Something wrong happend!");
			console.log("ERROR");
		}
	}
	else if (urlInfo[1] === "coffee"){
		coffee.get(true, urlInfo[2], function(tx1, tx2){
			res.end(tx1 + "\n" + tx2);
			console.log("Coffee for " + urlInfo[2]);
		});
	}else if (urlInfo[1] === "office"){
		office.get(urlInfo[2], function(status, message, light){
			res.end(status + "\n" + message);
			console.log("Office for " + urlInfo[2] + "\nLight: " + light);
		});
	}
	else {
		res.end("Wrong input");
		console.log("ERROR: Wrong input");
	}
});

function getHelpText(){
	var info = "localhost/info/linjeforening";
	var info1 = "coffee\noffice";
	var info2 = "localhost/hackerspace";
	return info + "\n" + info1 + "\n" + info2;
}

server.listen(80);

prompt.start();

prompt.get(["Info", "Affilation"], function(err, res){
	officeLight.get(res.Affilation, function(data){
		console.log(res.Affilation + " light: " + data);
	});
});


// coffee.get(true, function(text1, text2){
// 	console.log(text1);
// 	console.log(text2);
// });

// cantina.get("realfag", function(text1){
// 	console.log(text1);
// });

