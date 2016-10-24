const Affiliation = require('./affiliation');
const requests = require('./requests');
var debug = require('debug')('coffee');

const msgError = 'Klarte ikke lese status';
const msgDisconnected = 'Klarte ikke hente status';
const msgMissingSupport = 'Manglende støtte';

const retrieveCoffeeForToday = (coffeeDb, affiliation) => (
  new Promise((fullfill, reject) => {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
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
      fullfill({ date, pots });
    });
  })
);

const get = (req, affiliation) => {
  return new Promise((fullfill, reject) => {
    if(!Affiliation.hasHardware(affiliation)) {
      reject(msgMissingSupport);
      return;
    }
    if(Affiliation.hasLegacyCoffee(affiliation)) {
      // Legacy coffee status
      getLegacy(affiliation)
      .catch(reject)
      .then(fullfill);
      return;
    }
    var coffeeDb = req.db.get('coffee');
    retrieveCoffeeForToday(coffeeDb, affiliation).then(fullfill);
  });
}

const getAll = (req, affiliation, limit=10) => (
  new Promise((fullfill, reject) => {
    if(!Affiliation.hasHardware(affiliation) || Affiliation.hasLegacyCoffee(affiliation)) {
      reject(msgMissingSupport);
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
    }, {
      limit
    }, function(err, pots) {
      fullfill({
        pots: pots.map(function(pot) {
          return pot.brewed;
        })
      });
    });
  })
)

const getLegacy = (affiliation) => (
  new Promise((fullfill, reject) => {
    var api = Affiliation.org[affiliation].hw.apis.coffee;
    // Receives the status for the coffee pot
    requests.get(api, {
      success: function(data) {
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
          fullfill({ date, pots });
        } catch (err) {
          debug('ERROR: Coffee format is wrong:', err);
          reject(msgError);
        }
      },
      error: function(err, data) {
        debug('ERROR: Failed to get coffee pot status.');
        reject(msgDisconnected);
      }
    });
  })
)

module.exports = {
  get, getAll
}
