"use strict";
var requests = require('./requests');

// Google Calendar Wrapper
var Calendar = function(id, key) {
    this.baseUrl = 'https://www.googleapis.com/calendar/v3/calendars/';
    this.id = id;
    this.params = {
        timezone: 'Europe%2FOslo',
        maxResults: 10,
        orderBy: 'startTime',
        fields: 'items(description%2Cend%2Cstart%2Csummary)%2Cupdated',
        singleEvents: true,
        key: key
    };
};

Calendar.prototype.generateUrl = function() {
    var params = [];
    for(var key in this.params) {
        if(this.params.hasOwnProperty(key)) {
            params.push(key + '=' + this.params[key]);
        }
    }
    return this.baseUrl + this.id + '/events?' + params.join('&');
};

Calendar.prototype.timebounds = function(start, end) {
    this.params['timeMin'] = start.toISOString();
    this.params['timeMax'] = end.toISOString();
};

Calendar.prototype.get = function(callback) {
    requests.json(this.generateUrl(), callback);
};

module.exports = Calendar;
