"use strict";

var Affiliation = require('./affiliation');
var requests = require('./requests');

var Light = function() {
  this.msgError = 'Klarte ikke hente status';
  this.msgSupport = 'Manglende støtte';

  // Light limit, 0-860 is ON, 860-1023 is OFF
  this.lightLimit = 860;

  this.responseData = {};
};

Light.prototype.get = function(assosiation, callback) {
  if(!Affiliation.hasHardware(assosiation)) {
      // Missing support for light status
      this.responseData.error = this.msgSupport;
      callback(this.responseData);
      return;
  }
  var lightApi = Affiliation.org[assosiation].hw.apis.light;

  // Receives current light intensity from the office: OFF 0-lightLimit-1023 ON
  var self = this;
  requests.get(lightApi, {
    success: function(data) {
      var lights = false;

      if (!isNaN(data)) {
        lights = data < self.lightLimit;
      }
      else {
        lights = data.match(/(on|true|på)/gi) !== null;
      }
      self.responseData.open = lights;
      callback(self.responseData);
    },
    error: function(err, data) {
      if (self.debug) console.log('ERROR: Failed to get light data.');
      self.responseData.error = self.msgError;
      callback(self.responseData);
    }
  });
};

module.exports = Light;
