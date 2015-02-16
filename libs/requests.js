var request = require('request');
var xml2js = require('xml2js');

// Small wrapper for request

var Requests = function() {

    this.json = function(options, params) {
        options = this.urlToOptions(options);
        options.json = true;
        this.get(options, params);
    };

    this.xml = function(options, params) {
        this.get(options, {
            success: function(xml) {
                xml2js.parseString(xml, function (err, result) {
                    params.success(result);
                });
            },
            error: params.error
        });
    };

    this.get = function(options, params) {
        options = this.urlToOptions(options);
        if(options.headers  == undefined) {
            options.headers = {'User-Agent': 'Online Notiwire (https://github.com/appKom/notiwire2)'};
        }
        request(options, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                params.success(body);
            }
            else {
                params.error(error, body);
            }
        });
    };

    this.urlToOptions = function(options) {
        if(typeof options === 'string') {
            options = {url: options};
        }
        return options;
    };
};


module.exports = new Requests();
