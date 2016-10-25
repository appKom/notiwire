const Affiliation = require('./affiliation');
const debug = require('debug')('status');
const requests = require('./requests');

const MSG_ERROR = 'Klarte ikke hente status';
const MSG_SUPPORT = 'Manglende støtte';

// Light limit, 0-860 is ON, 860-1023 is OFF
const LIGHT_LIMIT = 860;


const get = (req, affiliation) => (
  new Promise((fullfill, reject) => {
    if(!Affiliation.hasHardware(affiliation)) {
        // Missing support for light status
        reject(MSG_SUPPORT);
    }
    if(Affiliation.hasLegacyLight(affiliation)) {
      // Legacy light status
      getLegacy(affiliation)
      .catch(reject)
      .then(fullfill);
      return;
    }
    const lastDay = new Date();
    lastDay.setDate(lastDay.getDate() - 1);
    const statusDb = req.db.get('status');
    statusDb.findOne({
      $query: {
        affiliation: affiliation,
        updated: {$gte: lastDay} // Only get status updates from the last 24h
      },
      $orderby: {
        updated: -1 // Latest first
      }
    }, (err, status) => {
      if(err !== null) {
        // Something went wrong!
        reject(MSG_ERROR);
      }
      else if(status !== null) {
        fullfill({
          status: status.status,
          updated: status.updated
        })
      }
      else {
        // No status updated today
        fullfill({
          status: null,
          updated: null
        });
      }
    });
  })
);

const getLegacy = (affiliation, callback) => (
  new Promise((fullfill, reject) => {
    const lightApi = Affiliation.org[affiliation].hw.apis.light;

    // Receives current light intensity from the office: OFF 0-lightLimit-1023 ON
    requests.get(lightApi, {
      success: (data) => {
        let lights = false;

        if (!isNaN(data)) {
          lights = data < LIGHT_LIMIT;
        }
        else {
          lights = data.match(/(on|true|på)/gi) !== null;
        }
        fullfill({
          status: lights
        });
      },
      error: (err, data) => {
        debug('ERROR: Failed to get light data.');
        reject(MSG_ERROR);
      }
    });
  })
);

module.exports = { get };
