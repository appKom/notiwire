"use strict";
var Affiliation = require('./affiliation');
var requests = require('./requests');

var Coffee = function() {
  this.debug = 0;
  this.debugString = "200\n1. March 14:28:371";
  this.msgError = 'Klarte ikke lese status';
  this.msgDisconnected = 'Klarte ikke hente status';
  this.msgMissingSupport = 'Manglende støtte';

  this.responseData = {};
};

Coffee.prototype.get = function(req, affiliation, callback) {
  var that = this;
  if(!affiliation.hasHardware()) {
    this.responseData.error = this.msgMissingSupport;
    callback(this.responseData);
    return;
  }
  if(affiliation.hasLegacyCoffee()) {
    // Legacy coffee status
    this.getLegacy(affiliation, callback);
    return;
  }
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var coffeeDb = req.db.get('coffee');
  coffeeDb.find({
    $query: {
      affiliation: affiliation.key,
      brewed: {$gte: today} // Only match pots today
    },
    $orderby: {
      brewed: -1 // Latest first
    },
  }, function(err, coffee) {
    var pots = coffee.length;
    var date = null;
    if(pots > 0) {
       var lastPot = coffee[0];
       date = lastPot.brewed;
    }
    that.responseData.date = date;
    that.responseData.pots = pots;
    callback(that.responseData);
  });

};

Coffee.prototype.getLegacy = function(affiliation, callback) {
  var api = affiliation.getLegacyCoffeeAPI();

  // Receives the status for the coffee pot
  var self = this;
  requests.get(api, {
    success: function(data) {

      // If coffee debugging is enabled
      if (self.debug) {
        data = self.debugString;
      }

      try {
        // Split into pot number and age of last pot
        var pieces = data.split("\n");
        var pots = Number(pieces[0]);
        var ageString = pieces[1];

        var date = new Date(ageString);

        // We're only interested in pots today
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if(today > date) {
          date = null;
          pots = 0;
        }

        self.responseData.date = date;
        self.responseData.pots = pots;

        callback(self.responseData);
      } catch (err) {
        if (self.debug) console.log('ERROR: Coffee format is wrong:', err);
        self.responseData.error = self.msgError;
        callback(self.responseData);
      }
    },
    error: function(err, data) {
      if (self.debug) console.log('ERROR: Failed to get coffee pot status.');
      self.responseData.error = self.msgDisconnected;
      callback(self.responseData);
    }
  });
};

module.exports = Coffee;
