var async = require('async');
var express = require('express');
var router = express.Router();

var Affiliation = require("../libs/affiliation");
var Cantina = require("../libs/cantina");
var Coffee = require("../libs/coffee");
var Hackerspace = require("../libs/hackerspace");
var Status = require("../libs/status");
var Meeting = require("../libs/meeting");
var Servant = require("../libs/servant");

router.param('affiliation', function(req, res, next, id) {
  var affiliationDb = req.db.get('affiliation');
  affiliationDb.findOne({key: id}, function(err, affiliation) {
    if(err) {
      next(err);
    }
    else if(affiliation) {
      // Affiliation and api key was correct
      req.affiliation = new Affiliation(affiliation);
      next();
    }
    else {
      // Not found
      next(new Error('Fant ikke linjeforening'));
    }
  });
});

router.route('/affiliation/:affiliation').get(function(req, res) {
  async.parallel([
    function(callback) {
      var meeting = new Meeting();
      meeting.get(req.affiliation, function(data) {
        callback(null, {name: 'meeting', value: data});
      });
    },
    function(callback) {
      var servant = new Servant();
      servant.get(req.affiliation, function(data) {
        callback(null, {name: "servant", value: data});
      });
    },
    function(callback) {
      var coffee = new Coffee();
      coffee.get(req, req.affiliation, function(data) {
        callback(null, {name: 'coffee', value: data});
      });
    },
    function(callback) {
      var status = new Status();
      status.get(req, req.affiliation, function(data) {
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

router.route('/affiliation/').get(function(req, res) {
  var affiliationDb = req.db.get('affiliation');
  var query = {key: {$exists: true}, name: {$exists: true}};
  affiliationDb.find(query, "key name feed web -_id", function(err, affiliations) {
    res.json(affiliations);
  });
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

router.route('/cantina/').get(function(req, res) {
  var cantina = new Cantina();
  cantina.all(function(cantinas) {
    res.json(cantinas);
  });
});

module.exports = router;
