var apicache = require('apicache');
var cache = apicache.middleware;
var async = require('async');
var express = require('express');
var url = require('url');
var router = express.Router();

var Cantina = require("../libs/cantina");
var Coffee = require("../libs/coffee");
var Hackerspace = require("../libs/hackerspace");
var Status = require("../libs/status");
var Meeting = require("../libs/meeting");
var Servant = require("../libs/servant");

router.get('/affiliation/:affiliation', cache('1 hour'), function(req, res) {
  req.apicacheGroup = 'affiliation_' + req.params.affiliation;
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
      coffee.get(req, req.params.affiliation, function(data) {
        callback(null, {name: 'coffee', value: data});
      });
    },
    function(callback) {
      var status = new Status();
      status.get(req, req.params.affiliation, function(data) {
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

router.get('/coffee/:affiliation', cache('1 hour'), function(req, res) {
  var coffee = new Coffee();
  coffee.getAll(req, req.params.affiliation, function(data) {
    res.json(data);
  });
});

router.get('/hackerspace', cache('1 minute'), function(req, res) {
  var hackerspace = new Hackerspace();
  hackerspace.get(function(data) {
    res.json(data);
  });
});

router.get('/cantina/:location', cache('1 hour'), function(req, res) {
  var cantina = new Cantina();
  cantina.get(req.params.location, function(data) {
    res.json(data);
  });
});

router.get('/cantina/', cache('12 hour'), function(req, res) {
  var cantina = new Cantina();
  cantina.all(function(cantinas) {
    res.json(cantinas);
  });
});

module.exports = router;
