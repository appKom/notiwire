var async = require('async');
var express = require('express');
var router = express.Router();

var Cantina = require("../libs/cantina");
var Coffee = require("../libs/coffee");
var Hackerspace = require("../libs/hackerspace");
var Light = require("../libs/light");
var Meeting = require("../libs/meeting");
var Servant = require("../libs/servant");

router.route('/office/:affiliation').get(function(req, res) {
  async.parallel([
    function(callback) {
      var meeting = new Meeting();
      meeting.get(req.params.affiliation, function(data) {
        callback(null, {name: 'meeting', value: data});
      });
    },
    function(callback) {
      var servant = new Servant();
      servant.get(req.params.affiliation, function(data) {
        callback(null, {name: "servant", value: data});
      });
    },
    function(callback) {
      var coffee = new Coffee();
      coffee.get(req.params.affiliation, function(data) {
        callback(null, {name: 'coffee', value: data});
      });
    },
    function(callback) {
      var light = new Light();
      light.get(req.params.affiliation, function(data) {
        callback(null, {name: 'status', value: data});
      });
    }
    ],
    function(err, results) {
      var data = {};
      results.forEach(function(result) {
        data[result.name] = result.value;
      });
      res.json(data);
    }
    );  
});

router.route('/hackerspace').get(function(req, res) {
  var hackerspace = new Hackerspace();
  hackerspace.get(function(data) {
    res.json(data);
  });
});

router.route('/cantina/:location').get(function(req, res) {
  var cantina = new Cantina();
  cantina.get(req.params.location, function(data) {
    res.json(data);
  });
});

module.exports = router;
