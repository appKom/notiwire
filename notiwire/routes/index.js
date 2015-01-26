var express = require('express');
var router = express.Router();
var office = require("../../js/office.js");
var cantina = require("../../js/cantina.js");
var hackerspace = require("../../js/hackerspace.js");
var coffee = require("../../js/coffee.js");
var meetings = require("../../js/meetings.js");
var officeLight = require("../../js/officeLight.js");
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
            "status": data
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
  hackerspace.get(function(message) {
    res.json({'message': message});
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
