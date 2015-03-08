"use strict";
var Affiliation = require("./affiliation");
var requests = require("./requests");

var Servant = function() {
  this.debug = 0;
  this.debugString = '11:00-12:00 Steinar Hagen\n12:00-13:00 Espen Skarsbø Kristoffersen Olsen\n13:00-14:00 Aina Elisabeth Thunestveit';
  
  this.msgNone = 'Ingen ansvarlige nå';
  this.msgError = 'Frakoblet fra ansvarkalender';

  this.responseData = {};
};

Servant.prototype.get = function(affiliation, callback) {
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
  var self = this;

  requests.get(api, {
    success: function(servant) {

      // If servant debugging is enabled
      if (self.debug) {
        servant = self.debugString;
      }
      var servantList = servant.split("\n");
      var currentServant = servantList[0];

      // If it's an actual servant with a time slot like this:
      // 12:00-13:00: Michael Johansen
      var pieces, timeSlot, servantName;
      if (currentServant.match(/\d+:\d+\-\d+:\d+/)) {
        // Match out the name from the line
        pieces = currentServant.match(/(\d+:\d+\-\d+:\d+) ([0-9a-zA-ZæøåÆØÅ \-]+)/);
        timeSlot = pieces[1];
        servantName = pieces[2];

        // If we are currently within the specified timeslot "12:00-13:00"
        var timePieces = timeSlot.split("-"); // ["12:00", "13:00"]
        var startTime = timePieces[0].split(":"); // ["12", "00"]
        var endTime = timePieces[1].split(":"); // ["13", "00"]
        var now = new Date();
        var start = new Date();
        start.setHours(startTime[0]);
        start.setMinutes(startTime[1]);
        var end = new Date();
        end.setHours(endTime[0]);
        end.setMinutes(endTime[1]);

        if (start <= now && now <= end) {
          servantName = self.shortenServantName(servantName);
          callback(servantName);
        }
        else {
          // No servant in this timeslot
          callback(self.msgNone);
        }
      }
      // If it's an actual servant with a date slot instead:
      // 10.2-14.2 Michael Johansen
      else if (currentServant.match(/\d+\.\d+\-\d+\.\d+/)) {
        // Match out the name from the line
        pieces = currentServant.match(/(\d+\.\d+\-\d+\.\d+) (.*)/);
        timeSlot = pieces[1];
        servantName = pieces[2];

        // Assume we are within the correct dates
        servantName = self.shortenServantName(servantName);
        callback(servantName);
      }
      else {
        // No more servants today
        callback(self.msgNone);
      }
    },
    error: function(jqXHR, text, err) {
      if (self.debug) console.log('ERROR: Failed to get current servant.');
      callback(self.msgError);
    }
  });
};

Servant.prototype.shortenServantName = function(name) {
  // If there are multiple names, don't shorten
  if (name.match(/ ?(,|&|og|and) /gi) !== null) {
    return name;
  }
  // If the name is quite long...
  if (name.length >= 25) {
    if (name.split(" ").length >= 3) {
      names = name.split(" ");
      // ...we'll shorten all middle names to one letter
      for (var i = names.length - 2; i >= 1; i--) {
        names[i] = names[i].charAt(0).toUpperCase()+'.';
      }
      name = '';
      for (i in names) {
        name += names[i] + " ";
      }
    }
  }
  return name;
};

module.exports = Servant;
