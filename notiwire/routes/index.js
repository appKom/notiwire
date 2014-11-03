var express = require('express');
var router = express.Router();
var office = require("../../js/office.js");
var cantina = require("../../js/cantina.js");

/* GET home page. */
router.get('/office/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.route('/office/:affiliation').get(function(req, res) {
    office.get(req.params.affiliation, function(status, message) {
        res.send(message);
    });
});

router.route('/cantina/:location').get(function(req, res) {
    cantina.get(req.params.location, function(dinnerObjects) {
        res.jsonp(dinnerObjects);
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
