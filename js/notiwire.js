var coffee = require("./coffee.js");
var cantina = require("./cantina.js");
var office = require("./office.js");
var http = require("http");

var server = http.createServer(function(req, res){
	var urlInfo = req.url.split("/");
	if (urlInfo.length !== 3){
		if (urlInfo.length == 2 && (urlInfo[1] == "info" || urlInfo[1] == "help")){
			res.end(getHelpText());
		}else
			res.end("Something wrong happend!");
	}
	else if (urlInfo[1] === "coffee"){
		coffee.get(true, urlInfo[2], function(tx1, tx2){
			res.end(tx1 + "\n" + tx2);
		});
	}else if (urlInfo[1] === "office"){
		office.get(urlInfo[2], function(status, message){
			res.end(status + "\n" + message);
		});
	}
	else {
		res.end("Wrong input");
	}
});

function getHelpText(){
	var info = "write in url: localhost/info1/info2";
	var info1 = "coffee/linjeforening\noffice/linjeforening";
	return info + "\n" + info1;
}

server.listen(80);

// coffee.get(true, function(text1, text2){
// 	console.log(text1);
// 	console.log(text2);
// });

// cantina.get("realfag", function(text1){
// 	console.log(text1);
// });

