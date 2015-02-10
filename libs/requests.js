var request = require('request');
var xml2js = require('xml2js');

// Small wrapper for request

var Requests = function() {

    this.json = function(options, params) {
        if(typeof options === 'string') {
            options = {url: options};
        }
        options.json = true;
        this.get(options, params);
    };

    this.xml = function(options, params) {
        this.get(options, {
            success: function() {
                xml2js.parseString(xml, function (err, result) {
                    params.success(result);
                });
            },
            error: params.error
        });
    };

    this.get = function(options, params) {

        request(options, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                params.success(body);
            }
            else {
                params.error(body);
            }
        });
    };
};


module.exports = new Requests();
