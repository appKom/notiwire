var async = require('async');
var express = require('express');
var router = express.Router();

var office = require("../libs/office.js");
var cantina = require("../libs/cantina.js");
var hackerspace = require("../libs/hackerspace.js");
var coffee = require("../libs/coffee.js");
var meetings = require("../libs/meetings.js");

var httpErrorStatus = function(data, res) {
    if(data.error) {
        res.status(400);
    }
};

/* GET home page. */
router.get('/office/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.route('/office/:affiliation').get(function(req, res) {
    async.parallel([
        function(callback) {
          coffee.get(req.params.affiliation, function(data){
              callback(null, {name: 'coffee', value: data});
          });
        },
        function(callback) {
          office.getEventData(req.params.affiliation, function(data) {
              callback(null, {name: 'event', value: data});
          });
        },
        function(callback) {
          office.getLightData(req.params.affiliation, function(data) {
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
    hackerspace.get(function(data) {
        httpErrorStatus(data, res);
        res.json(data);
    });
});

router.route('/cantina/:location').get(function(req, res) {
    cantina.get(req.params.location, function(data) {
        httpErrorStatus(data, res);
        res.json(data);
    });
});

module.exports = router;
