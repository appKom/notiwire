const debug = require('debug')('meeting');
const Affiliation = require('./affiliation');
const requests = require('./requests');
const Calendar = require('./calendar');
const config = require('../config.json');

const MSG_NONE = 'Ledig resten av dagen';
const MSG_ERROR = 'Frakoblet fra møtekalender';
const MSG_DISCONNECTED = 'Klarte ikke hente status';
const MSG_MISSING_SUPPORT = 'Manglende støtte';
const MSG_UNKNOWN = 'Ukjent forening';
const MSG_OCCUPIED = 'Kontoret er opptatt';


const get = (affiliation, callback) => (
  new Promise((fullfill, reject) => {
    if (Affiliation.org[affiliation] === undefined) {
      reject(MSG_UNKNOWN);
      return;
    }
    if(!Affiliation.hasHardware(affiliation) || !Affiliation.org[affiliation].hw.apis.meetings) {
      reject(MSG_MISSING_SUPPORT);
      return;
    }

    const api = Affiliation.org[affiliation].hw.apis.meetings;

    const calendar = new Calendar(api, config.calendarKey);
    calendar.todayOnly();
    calendar.get({
      success: (meetings) => {
        meetings.forEach(function(meeting) {
          meeting.message = prettifyTodaysMeetings(meeting.pretty + ' ' + meeting.summary);
        });

        let message = MSG_NONE;
        let free = true;

        // Meeting is going on right now
        if(meetings.length > 0) {
          const current = meetings[0];
          const now = new Date();
          if (current.start.date <= now && now <= current.end.date) {
            message = MSG_OCCUPIED;
            free = false;
          }
        }
        fullfill({ message, free, meetings });
      },
      error: function(err, body) {
        reject(MSG_ERROR);
      }
    });
  })
);

const prettifyTodaysMeetings = function(meetings) {
  meetings = meetings.trim();
  // Change 00:00 to 24
  meetings = meetings.replace(/00:00/g, '24');
  debug('24\t::', meetings);
  // Remove unnecessarily specific time info 10:00 -> 10, including the academic fifteen minutes
  meetings = meetings.replace(/:(00|15)/g, '');
  debug(':00\t::', meetings);
  // Trim unnecessary zero in time 08 -> 8
  meetings = meetings.replace(/0(\d)/g, '$1');
  debug('08\t::', meetings);
  // Add spaces for...
  // ...times "10-16:30" -> "10 - 16:30"
  // ...days "Fredag-Søndag" -> "Fredag - Søndag"
  // ...dates "14.2-16.2" -> "14.2 - 16.2"
  meetings = meetings.replace(/(dag|\d) ?- ?(\d+[\.:]?\d*|[a-zæøå]+dag)/gi, '$1 - $2:');
  debug('_ \t::', meetings);
  // Change times like 23:30 and 23:59 to just 24
  meetings = meetings.replace(/22:(30|59)/g, '23');
  meetings = meetings.replace(/23:(30|59)/g, '24');
  debug(':30\t::', meetings);
  return meetings;
};

module.exports = { get };
