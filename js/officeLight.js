module.exports = {
	get: function(assosiation, callback){
		if (callback === undefined){
			console.log("ERROR: callback must be defined.");
			return;
		}
		var Affiliation = require("./affiliation.js");
		var lightApi = Affiliation.org[assosiation].hw.apis.light;
		var Ajaxer = require("./ajaxer.js");
		Ajaxer.getPlainText({
	      	url: lightApi,
	      	success: function(data){
	      		callback(data);
	      	},
	      	error: function(jqXHR, err) {
	        	if (self.debug) console.log('ERROR: Failed to get light data.');
	        	callback("");
      		},
    	});
	}
}