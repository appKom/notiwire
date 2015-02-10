var express = require('express');
var router = express.Router();
var office = require("../libs/office.js");
var cantina = require("../libs/cantina.js");
var hackerspace = require("../libs/hackerspace.js");
var coffee = require("../libs/coffee.js");
var meetings = require("../libs/meetings.js");
var officeLight = require("../libs/officeLight.js");
/* GET home page. */
router.get('/office/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.route("/meeting/:affiliation").get(function(req, res){
    meetings.get(req.params.affiliation, function(meeting){
        res.json({
          "status": meeting
        });
    });
});

router.route("/light/:affiliation").get(function(req, res){
    officeLight.get(req.params.affiliation, function(data){
      res.json({
          "status": data !== null ? "success" : "error",
          "data": data
      });
    });
});

router.route("/coffee/:affiliation").get(function(req, res){
    coffee.get(false, req.params.affiliation, function(pots, age){
        res.json({
          "status":pots,
          "time":age
        });
    });
});
router.route('/office/:affiliation').get(function(req, res) {
    office.get(req.params.affiliation, function(status, message) {
        res.json({
          'status': status,
          'message': message
        });
    });
});

router.route('/hackerspace').get(function(req, res) {
  hackerspace.get(function(data) {
    res.json(data);
  });
});

router.route('/cantina/:location').get(function(req, res) {
    cantina.get(req.params.location, function(dinnerObjects) {
        res.json(dinnerObjects);
    });
});

router.param('test_id', function(req, res, next, id) {
  req.user = {
    id: id,
    name: 'TJ'
  };
  next();
});

router.route('/test/:test_id').all(function(req, res, next) {
  next();
}).get(function(req, res, next) {
  res.json(req.user);
});

module.exports = router;
