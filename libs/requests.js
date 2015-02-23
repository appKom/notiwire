"use strict";
var request = require('request');
var xml2js = require('xml2js');

// Small wrapper for request

var Requests = function() {

    this.json = function(options, params) {
        options = urlToOptions(options);
        options.json = true;
        this.request(options, params);
    };

    this.xml = function(options, params) {
        this.request(options, {
            success: function(xml) {
                xml2js.parseString(xml, function (err, result) {
                    params.success(result);
                });
            },
            error: params.error
        });
    };

    this.get = function(options, params) {
        this.request(options, params);
    };

    this.request = function(options, params) {
        options = urlToOptions(options);
        if(options.headers  == undefined) {
            options.headers = {'User-Agent': 'Online Notiwire (https://github.com/appKom/notiwire2)'};
        }
        this.method = get;
        // POST request
        if(options.data != undefined) {
            this.method = post;
            options.formData = options.data;
        }
        options.timeout = 6000;
        this.method(options, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                params.success(body);
            }
            else {
                params.error(error, body);
            }
        });
    };

    // Internal
    var post = function(options, callback) {
        request.post(options, callback);
    };

    var get = function(options, callback) {
        request(options, callback);
    };


    var urlToOptions = function(options) {
        if(typeof options === 'string') {
            options = {url: options};
        }
        return options;
    };
};


module.exports = new Requests();
