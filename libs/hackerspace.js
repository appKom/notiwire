"use strict";
var Ajaxer = require("./ajaxer.js");

module.exports = {
  debug: 0,

  web: 'http://hackerspace.idi.ntnu.no/',
  api: 'http://hackerspace.idi.ntnu.no/api/door',
  
  msgPrefix: '<span>Hackerspace:</span> ',
  msgDisconnected: 'Frakoblet fra Hackerspace',
  msgError: 'Malformatert data fra Hackerspace',
  msgOpen: 'Åpent',
  msgClosed: 'Stengt',
  
  get: function(callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    
    // Receives the meeting plan for today
    var self = this;
    var data = {};
    Ajaxer.getJson({
      url: self.api,
      success: function(door) {
        if (self.debug) console.log('Raw door:\n\n', door);

        if (typeof door === 'object') {
          data.open = door.isOpen.door;
        }
        else {
          // Empty string returned from API
          data.error = self.msgError;
        }
        callback(data);
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR: Failed to get hackerspace info.');
        data.error = self.msgDisconnected;
        callback(data);
      }
    });
  }
};
