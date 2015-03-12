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

Light.prototype.get = function(req, affiliation, callback) {
  var that = this;
  if(!Affiliation.hasHardware(affiliation)) {
      // Missing support for light status
      this.responseData.error = this.msgSupport;
      callback(this.responseData);
      return;
  }
  if(Affiliation.hasLegacyLight(affiliation)) {
    // Legacy light status
    this.getLegacy(affiliation, callback);
    return;
  }
  var lastDay = new Date();
  lastDay.setDate(lastDay.getDate() - 1);
  var lightDb = req.db.get('light');
  lightDb.findOne({
    $query: {
      affiliation: affiliation,
      updated: {$gte: lastDay} // Only get light updates from the last 24h
    },
    $orderby: {
      updated: -1 // Latest first
    }
  }, function(err, light) {
    if(err !== null) {
      // Something went wrong!
      that.responseData.error = that.msgError;
    }
    else if(light !== null) {
      that.responseData.status = light.status;
      that.responseData.updated = light.updated;
    }
    else {
      // No light updated today
      that.responseData.status = null;
      that.responseData.updated = null;
    }
    callback(that.responseData);
  });
};

Light.prototype.getLegacy = function(affiliation, callback) {
  var lightApi = Affiliation.org[affiliation].hw.apis.light;

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
