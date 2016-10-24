"use strict";
const requests = require('./requests');
const debug = require('debug')('hackerpace');

const API_URL = 'https://hackerspace-ntnu.no/door/get_status/';

const MSG_DISCONNECTED = 'Frakoblet fra Hackerspace';
const MSG_ERROR = 'Malformatert data fra Hackerspace';

const get = () => (
  new Promise((fullfill, reject) => {
    requests.json(API_URL, {
      success: door => {
        debug('Raw door:\n\n', door);

        if (typeof door === 'string') {
          fullfill({ open: door === 'True' });
        }
        else {
          // Empty string returned from API
          reject(MSG_ERROR);
        }
      },
      error: function(jqXHR, text, err) {
        debug('ERROR: Failed to get hackerspace info.');
        reject(MSG_DISCONNECTED);
      }
    });
  })
);

module.exports = { get };
