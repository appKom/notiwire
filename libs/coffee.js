const Affiliation = require('./affiliation');
const requests = require('./requests');

const msgError = 'Klarte ikke lese status';
const msgDisconnected = 'Klarte ikke hente status';
const msgMissingSupport = 'Manglende støtte';


const get = function(req, affiliation, callback) {
  if(!Affiliation.hasHardware(affiliation)) {
    callback({ error: msgMissingSupport });
    return;
  }
  if(Affiliation.hasLegacyCoffee(affiliation)) {
    // Legacy coffee status
    getLegacy(affiliation, callback);
    return;
  }
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var coffeeDb = req.db.get('coffee');
  coffeeDb.find({
    $query: {
      affiliation: affiliation,
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
    callback({
      date, pots
    });
  });

};

const getAll = function(req, affiliation, callback) {
  if(!Affiliation.hasHardware(affiliation)) {
    callback({
      error: msgMissingSupport
    });
    return;
  }
  var coffeeDb = req.db.get('coffee');
  coffeeDb.find({
    $query: {
      affiliation: affiliation
    },
    $orderby: {
      brewed: -1 // Latest first
    }
  }, function(err, pots) {
    callback({
      pots: pots.map(function(pot) {
        return pot.brewed;
      })
    });
  });
};

const getLegacy = function(affiliation, callback) {
  var api = Affiliation.org[affiliation].hw.apis.coffee;

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
        callback({ date, pots });
      } catch (err) {
        if (self.debug) console.log('ERROR: Coffee format is wrong:', err);
        callback({ error: msgError });
      }
    },
    error: function(err, data) {
      if (self.debug) console.log('ERROR: Failed to get coffee pot status.');
      callback({ error: msgDisconnected });
    }
  });
};

module.exports = {
  get, getAll, getLegacy
}
