"use strict";
var moment = require('moment-timezone');
var requests = require('./requests');

// Google Calendar Wrapper
var Calendar = function(id, key) {
    this.baseUrl = 'https://www.googleapis.com/calendar/v3/calendars/';
    this.id = id;
    this.params = {
        timezone: 'Europe/Oslo',
        maxResults: 10,
        orderBy: 'startTime',
        fields: 'items(description%2Cend%2Cstart%2Csummary)%2Cupdated',
        singleEvents: true,
        key: key
    };

    // Misc

    // Fucking Americans and their silly week systems
    this.weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
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

Calendar.prototype.pad = function(time) {
    // Zero pad time (8 -> 08)
    return ('0' + time).slice(-2);
};

Calendar.prototype.prettyDate = function(meetingDate) {
    var dateString = meetingDate.dateTime;
    if(dateString === undefined) {
        dateString = meetingDate.date;
    }
    var date = moment(dateString).tz(this.params.timezone);
    var tonight = moment().add(1, 'days').hour(0).minute(0).second(0);
    // Before 01:00 will show HH:MM
    if(date <= tonight) {
        return date.format('HH:mm');
    }
    // else day
    return this.weekdays[date.days()];
};

Calendar.prototype.prettify = function(meeting) {
    // Convert full day events to datetimes
    if(meeting.start.date === undefined) {
        meeting.start.date = meeting.start.dateTime;
        meeting.start.dateTime = undefined;
    }
    else {
        meeting.start.date = new Date(meeting.start.date);
        meeting.start.date.setHours(0, 0, 0, 0);
    }
    if(meeting.end.date === undefined) {
        meeting.end.date = meeting.end.dateTime;
        meeting.end.dateTime = undefined;
    }
    else {
        meeting.end.date = new Date(meeting.end.date);
        // Last second of the day
        meeting.end.date.setHours(23, 59, 59, 59);
    }
    // String to Date
    meeting.start.date = new Date(meeting.start.date);
    meeting.end.date = new Date(meeting.end.date);

    // Add pretty strings
    meeting.start.pretty = this.prettyDate(meeting.start);
    meeting.end.pretty = this.prettyDate(meeting.end);
    meeting.pretty = meeting.start.pretty + '-' + meeting.end.pretty;
};

Calendar.prototype.timebounds = function(start, end) {
    this.params['timeMin'] = start.toISOString();
    this.params['timeMax'] = end.toISOString();
};

Calendar.prototype.todayOnly = function() {
    this.params['timeMin'] = new Date().toISOString();
    var midnight = new Date();
    midnight.setHours(23);
    midnight.setMinutes(59);
    this.params['timeMax'] = midnight.toISOString();
}

Calendar.prototype.get = function(callback) {
    var that = this;
    requests.json(this.generateUrl(), {
        success: function(meetings) {
            meetings.items.forEach(function(meeting) {
                that.prettify(meeting);
            });
            callback.success(meetings.items);
        },
        error: callback.error
    });
};

module.exports = Calendar;
