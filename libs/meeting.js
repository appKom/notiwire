"use strict";
var Affiliation = require('./affiliation');
var requests = require('./requests');
var Calendar = require('./calendar');
var config = require('../config.json');

var Meeting = function() {
  this.msgNone = 'Ledig resten av dagen';
  this.msgError = 'Frakoblet fra møtekalender';
  this.msgDisconnected = 'Klarte ikke hente status';
  this.msgMissingSupport = 'Manglende støtte';
  this.msgUnknown = 'Ukjent forening';

  this.responseData = {};
};

Meeting.prototype.get = function(affiliation, callback) {
  var self = this;
  if (Affiliation.org[affiliation] === undefined){
    this.responseData.error = this.msgUnknown;
    callback(this.responseData);
    return;
  }
  if(!Affiliation.hasHardware(affiliation)) {
    this.responseData.error = this.msgMissingSupport;
    callback(this.responseData);
    return;
  }
  
  var api = Affiliation.org[affiliation].hw.apis.meetings;

  var calendar = new Calendar(api, config.calendarKey);
  calendar.todayOnly();
  calendar.get({
    success: function(meetings) {
      meetings.forEach(function(meeting) {
        meeting.prettier = self.prettifyTodaysMeetings(meeting.pretty + ' ' + meeting.summary);
      });
      callback(meetings);
    },
    error: function(err, body) {
      self.responseData.error = self.msgError;
      callback(self.responseData);
    }
  });
};

Meeting.prototype.prettifyTodaysMeetings = function(meetings) {
  meetings = meetings.trim();
  // Change 00:00 to 24
  meetings = meetings.replace(/00:00/g, '24');
  if (this.debug) console.log('24\t::', meetings);
  // Remove unnecessarily specific time info 10:00 -> 10, including the academic fifteen minutes
  meetings = meetings.replace(/:(00|15)/g, '');
  if (this.debug) console.log(':00\t::', meetings);
  // Trim unnecessary zero in time 08 -> 8
  meetings = meetings.replace(/0(\d)/g, '$1');
  if (this.debug) console.log('08\t::', meetings);
  // Add spaces for...
  // ...times "10-16:30" -> "10 - 16:30"
  // ...days "Fredag-Søndag" -> "Fredag - Søndag"
  // ...dates "14.2-16.2" -> "14.2 - 16.2"
  meetings = meetings.replace(/(dag|\d) ?- ?(\d+[\.:]?\d*|[a-zæøå]+dag)/gi, '$1 - $2:');
  if (this.debug) console.log('_ \t::', meetings);
  // Change times like 23:30 and 23:59 to just 24
  meetings = meetings.replace(/22:(30|59)/g, '23');
  meetings = meetings.replace(/23:(30|59)/g, '24');
  if (this.debug) console.log(':30\t::', meetings);
  return meetings;
};

module.exports = Meeting;
