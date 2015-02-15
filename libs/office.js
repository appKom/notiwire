var Affiliation = require('./affiliation');
var requests = require('./requests');

Office = {
  debug: 1, 
  debugStatus: {enabled: 0, string: 'coffee\nDebugging office status'},

  // Light limit, 0-860 is ON, 860-1023 is OFF
  lightLimit: 860,
  // Basic statuses have titles and messages (icons are fetched from affiliation)
  statuses: {
    'error': {title: 'Oops', color: 'LightGray', message: 'Klarte ikke hente kontorstatus'},
    'open': {title: 'Åpent', color: 'LimeGreen', message: 'Gratis kaffe og te til alle!'},
    'closed': {title: 'Lukket', color: 'yellow', message: 'Finn et komitemedlem'},
    'meeting': {title: 'Møte', color: 'red', message: 'Kontoret er opptatt'}, // meetings usually get message from calendar entries
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
    var responseData = {};
    if(Affiliation.org[assosiation].hw === undefined) {
      // Missing support for office status
      responseData.error = self.statuses['error'].message;
      callback(responseData);
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
        }
        status = status.trim();
        // Set the status from fetched data
        switch(status) {

          case 'free': callback('free'); break;

          case 'meeting': callback('meeting', message); break;

          case 'bun': callback('bun', message); break;
          case 'cake': callback('cake', message); break;
          case 'coffee': callback('coffee', message); break;
          case 'waffle': callback('waffle', message); break;
          case 'pizza': callback('pizza', message); break;
          case 'taco': callback('taco', message); break;

          case 'error':
          default: callback('error', self.statuses['error'].message);
        }
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
      if(Affiliation.org[assosiation].hw === undefined) {
        // Missing support for office status
        responseData.error = 'Failed to get light data';
        callback(responseData);
        return;
    }
    var lightApi = Affiliation.org[assosiation].hw.apis.light;

    var debugStatus = null;
    if (this.debugOpenOrClosed())
      if (this.debugStatus.string.startsWith('closed'))
        debugStatus = 'closed';

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

        if (lights || debugStatus == 'open') {
          if (self.debug) console.log('Office:\n- status is open\n- message is', self.statuses['open'].message);
        }
        else {
          if (self.debug) console.log('Office:\n- status is closed\n- message is', self.statuses['closed'].message);
        }
        callback(lights);
      },
      error: function(jqXHR, err) {
        if (self.debug) console.log('ERROR: Failed to get light data.');
        callback(null);
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