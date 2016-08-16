"use strict";
var requests = require('./requests');

var Hackerspace = function() {
  this.debug = 0;

  this.web = 'https://hackerspace-ntnu.no/';
  this.api = 'https://hackerspace-ntnu.no/door/get_status/';

  this.msgDisconnected = 'Frakoblet fra Hackerspace';
  this.msgError = 'Malformatert data fra Hackerspace';
  this.responseData = {};
};

Hackerspace.prototype.get = function(callback) {
  var self = this;
  requests.json(self.api, {
    success: function(door) {
      if (self.debug) console.log('Raw door:\n\n', door);

      if (typeof door === 'string') {
        self.responseData.open = door === 'True';
      }
      else {
        // Empty string returned from API
        self.responseData.error = self.msgError;
      }
      callback(self.responseData);
    },
    error: function(jqXHR, text, err) {
      if (self.debug) console.log('ERROR: Failed to get hackerspace info.');
      self.responseData.error = self.msgDisconnected;
      callback(self.responseData);
    }
  });
};

module.exports = Hackerspace;
