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
Coffee.prototype.get = function(assosiation, callback) {
  if(!Affiliation.hasHardware(assosiation)) {
    this.responseData.error = this.msgMissingSupport;
    callback(this.responseData);
    return;
  }
  var api = Affiliation.org[assosiation].hw.apis.coffee;

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

        var unix = Date.parse(ageString);
        var date = new Date(unix);

        self.responseData.unix = unix;
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
