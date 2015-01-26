module.exports = {
  get: function(assosiation, callback){
    if (callback === undefined){
      console.log("ERROR: callback must be defined.");
      return;
    }
    var Affiliation = require("./affiliation.js");
    if (Affiliation.org[assosiation] === undefined){
      callback(null);
      return;
    }
    if (Affiliation.org[assosiation].hw === undefined){
      callback(null);
      return;
    }
    var lightApi = Affiliation.org[assosiation].hw.apis.light;
    var Ajaxer = require("./ajaxer.js");
    Ajaxer.getPlainText({
      url: lightApi,
      success: function(data){
        callback(data);
      },
      error: function(jqXHR, err) {
        callback(null);
      }
    });
  }
};
