var Affiliation = require('./affiliation.js');
var requests = require('./requests.js');

Coffee = {
  debug: 0,
  debugString: "200\n1. March 14:28:371",

  get: function(assosiation, callback) {
    if (callback == undefined) {
      console.log('ERROR: Callback is required.');
      return;
    }
    var responseData = {};
    if(!Affiliation.hasHardware(assosiation)) {
      responseData.error = 'Manglende støtte';
      callback(responseData);
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

          responseData.unix = unix;
          responseData.date = date;
          responseData.pots = pots;

          callback(responseData);
        } catch (err) {
          if (self.debug) console.log('ERROR: Coffee format is wrong:', err);
          responseData.error = 'Klarte ikke lese status';
          callback(responseData);
        }
      },
      error: function(err, data) {
        if (self.debug) console.log('ERROR: Failed to get coffee pot status.');
        responseData.error = 'Klarte ikke hente status';
        callback(responseData);
      }
    });
  }
};

module.exports = Coffee;
