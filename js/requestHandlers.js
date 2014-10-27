var coffee = require("./coffee.js");
var cantina = require("./cantina.js");
var office = require("./office.js");
var hackerspace = require("./hackerspace.js");
var officeLight = require("./officeLight.js");

module.exports = {
    hackerspace: function(response) {
        hackerspace.get(function(isOpen){
            response.end(isOpen);
        });
    },

    coffee: function(response) {
        coffee.get(true, 'online', function(tx1, tx2){
            console.log("Coffee");
            response.end(tx1 + "\n" + tx2);
        });
    },

    office: function(response) {
        office.get('online', function(status, message, light) {
            console.log("Office for online " + "\nLight: " + light);
            response.end(status + "\n" + message);
        });
    }
};
