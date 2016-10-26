const Affiliation = require("./affiliation");
const Calendar = require('./calendar');
const config = require('../config.json');

const requests = require("./requests");

const MSG_NONE = 'Ingen ansvarlige nå';
const MSG_ERROR = 'Frakoblet fra ansvarkalender';
const MSG_MISSING_SUPPORT = 'Manglende støtte';


const get = (affiliation, callback) => (
  new Promise((fullfill, reject) => {
    if (!Affiliation.hasHardware(affiliation) || !Affiliation.org[affiliation].hw.apis.servant) {
      reject(MSG_MISSING_SUPPORT);
    }
    const api = Affiliation.org[affiliation].hw.apis.servant;

    // Receives the meeting plan for today
    const calendar = new Calendar(api, config.calendarKey);
    calendar.todayOnly();
    calendar.get()
    .then(servants => {
      if(servants.length > 0) {
        const currentServant = servants[0];
        const now = new Date();
        if (currentServant.start.date <= now && now <= currentServant.end.date) {
          fullfill({
            responsible: true,
            message: currentServant.summary,
            servants
          })
          return;
        }
      }
      fullfill({
        responsible: false,
        message: MSG_NONE
      });
    })
    .catch((err, body) => {
      reject(MSG_ERROR);
    });
  })
);

module.exports = { get };
