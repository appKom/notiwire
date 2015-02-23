"use strict";

var Affiliation = require('./affiliation');
var requests = require('./requests');

var Office = {
  debug: 1, 
  debugStatus: {enabled: 0, string: 'coffee\nDebugging office status'},

  // Light limit, 0-860 is ON, 860-1023 is OFF
  lightLimit: 860,
  // Basic statuses have titles and messages (icons are fetched from affiliation)
  statuses: {
    'error': {title: 'Oops', color: 'LightGray', message: 'Klarte ikke hente kontorstatus'},
    'open': {title: 'Åpent', color: 'LimeGreen', message: 'Gratis kaffe og te til alle!'},
    'closed': {title: 'Lukket', color: 'yellow', message: 'Finn et komitemedlem'},
    'meeting': {title: 'Møte', color: 'red', message: 'Kontoret er opptatt'} // meetings usually get message from calendar entries
  },
  // Food statuses have titles and icons (messages exist as calendar titles)
  foods: {
    'bun': {title: 'Boller', color: 'NavajoWhite', icon: './img/icon-bun.png', image: './img/image-bun.png'},
    'cake': {title: 'Kake', color: 'NavajoWhite', icon: './img/icon-cake.png', image: './img/image-cake.png'},
    'coffee': {title: 'Kaffekos', color: 'NavajoWhite', icon: './img/icon-coffee.png'},
    'pizza': {title: 'Pizza', color: 'NavajoWhite', icon: './img/icon-pizza.png', image: './img/image-pizza.png'},
    'taco': {title: 'Taco', color: 'NavajoWhite', icon: './img/icon-taco.png', image: './img/image-taco.png'},
    'waffle': {title: 'Vafler', color: 'NavajoWhite', icon: './img/icon-waffle.png', image: './img/image-waffle.png'}
  },

  get: function(assosiation, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    // Remove later
  },

  getEventData: function(assosiation, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }
    var self = this;
    this.responseData = {};
    if(!Affiliation.hasHardware(assosiation)) {
      // Missing support for office status
      this.responseData.error = self.statuses['error'].message;
      callback(this.responseData);
      return;
    }
    var eventApi = Affiliation.org[assosiation].hw.apis.event;
    
    // Receives info on current event from Onlines servers (without comments)
    // meeting        // current status
    // Møte: appKom   // event title or 'No title'-meeting or nothing
    requests.get(eventApi, {
      success: function(data) {

        // Debug particular status?
        if (self.debug && self.debugStatus.enabled) {
          data = self.debugStatus.string;
        }

        var status = data.split('\n',2)[0]; // 'meeting'
        var message = data.split('\n',2)[1]; // 'Arbeidskveld med arrKom'

        if (self.debug) console.log('status is "'+status+'" and message is "'+message+'"');

        // empty status message?
        if (status.trim() === '') {
          status = 'error';
        }
        status = status.trim();
        // empty meeting message?
        if (message.trim() === '') {
          if (status.match(/^(error|open|closed|meeting)$/i) !== null) {
            message = self.statuses[status].message;
          }
        }
        message = message.trim();

        // Unavailable calendars will be treated as empty (free status)
        if (message.indexOf('does not have a calendar for') !== -1) {
          status = 'free';
          message = 'Mangler støtte';
        }
        status = status.trim();
        // Set the status from fetched data
        console.log(status);
        self.responseData.status = status;
        self.responseData.message = message;
        if(self.foods[status] != undefined) {
          var food = self.foods[status];
          self.responseData.title = food.title;
          self.responseData.color = food.color;
          self.responseData.icon = food.icon;
          self.responseData.image = food.image;
        }
        else if(self.statuses[status] != undefined) {
          self.responseData.color = self.statuses[status].color;
        }
        callback(self.responseData);
      },
      error: function(jqXHR, text, err) {
        if (self.debug) console.log('ERROR: Failed to get event data.');
        callback('error', self.statuses['error'].message);
      }
    });
  },

  getLightData: function(assosiation, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required. In the callback you should insert the results into the DOM.');
      return;
    }

    var responseData = {};
      if(!Affiliation.hasHardware(assosiation)) {
        // Missing support for light status
        responseData.error = 'Manglende støtte';
        callback(responseData);
        return;
    }
    var lightApi = Affiliation.org[assosiation].hw.apis.light;

    var debugStatus = null;
    // if (this.debugOpenOrClosed())
      // if (this.debugStatus.string.startsWith('closed'))
      //   debugStatus = 'closed';

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
        responseData.open = lights;
        callback(responseData);
      },
      error: function(err, data) {
        if (self.debug) console.log('ERROR: Failed to get light data.');
        responseData.error = 'Klarte ikke hente status';
        callback(responseData);
      }
    });
  },

  debugOpenOrClosed: function() {
    if (this.debug && this.debugStatus.enabled) {
      if (this.debugStatus.string.startsWith('open') || this.debugStatus.string.startsWith('closed')) {
        return true;
      }
    }
    return false;
  }
};

module.exports = Office;
