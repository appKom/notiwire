"use strict";
var Affiliation = require("./affiliation");
var Calendar = require('./calendar');
var config = require('../config.json');

var requests = require("./requests");

var Servant = function() {
  this.debug = 0;
  this.debugString = '11:00-12:00 Steinar Hagen\n12:00-13:00 Espen Skarsbø Kristoffersen Olsen\n13:00-14:00 Aina Elisabeth Thunestveit';
  
  this.msgNone = 'Ingen ansvarlige nå';
  this.msgError = 'Frakoblet fra ansvarkalender';

  this.responseData = {};
};

Servant.prototype.get = function(affiliation, callback) {
  var self = this;
  if (callback == undefined) {
    console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
    return;
  }
  if (!Affiliation.hasHardware(affiliation)){
    this.responseData.error = "Manglende støtte";
    callback(this.responseData);
    return;
  }
  var api = Affiliation.org[affiliation].hw.apis.servant;

  // Receives the meeting plan for today
  var calendar = new Calendar(api, config.calendarKey);
  calendar.todayOnly();
  // DEBUG!!!
  var nextweek = new Date();
  nextweek.setDate(nextweek.getDate() + 7);
  calendar.timebounds(new Date(), nextweek);
  calendar.get({
    success: function(servants) {
      if(servants.length > 0) {
        var currentServant = servants[0];
        var now = new Date();
        if (currentServant.start.date <= now && now <= currentServant.end.date) {
          self.responseData.responsible = true;
          self.responseData.message = currentServant.summary;
          self.responseData.servants = servants;
          return callback(self.responseData);
        }
      }
      // No servant in this timeslot
      self.responseData.responsible = false;
      self.responseData.message = self.msgNone;
      callback(self.responseData);
    },
    error: function() {
      self.responseData.error = self.msgError;
      callback(self.responseData);
    }

  });
};

module.exports = Servant;
