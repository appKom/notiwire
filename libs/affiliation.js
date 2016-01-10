"use strict";

var Affiliation = function(affiliation) {
  this.affiliation = affiliation;
};

Affiliation.prototype.hasHardware = function() {
  return 'hw' in this.affiliation;
};

Affiliation.prototype.getMeetingAPI = function() {
  if(this.hasHardware()) {
    if(this.affiliation.hw.apis.meetings) {
      return this.affiliation.hw.apis.meetings;
    }
  }
  return null;
};

Affiliation.prototype.getServantAPI = function() {
  if(this.hasHardware()) {
    if(this.affiliation.hw.apis.servant) {
      return this.affiliation.hw.apis.servant;
    }
  }
  return null;
};

Affiliation.prototype.hasLegacyLight = function() {
  // TODO: Make this check less shit
  if(this.hasHardware()) {
    // True means notipi
    if(this.affiliation.hw.apis.light === true) {
      return false;
    }
    // Set to something else than true
    return this.affiliation.hw.apis.light !== undefined;
  }
  return false;
};

Affiliation.prototype.getLegacyLightAPI = function() {
  return this.affiliation.hw.apis.light;
};

Affiliation.prototype.hasLegacyCoffee = function() {
  // TODO: Make this check less shit
  if(this.hasHardware()) {
    // True means notipi
    if(this.affiliation.hw.apis.coffee === true) {
      return false;
    }
    // Set to something else than true
    return this.affiliation.hw.apis.coffee !== undefined;
  }
  return false;
};

Affiliation.prototype.getLegacyCoffeeAPI = function() {
  return this.affiliation.hw.apis.coffee;
};

module.exports = Affiliation;
