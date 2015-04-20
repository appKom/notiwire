var Coffee = require('../libs/coffee');
var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
  req.api_key = req.body.api_key;
  if(req.api_key === undefined) {
    res.json(new Error('Mangler apinøkkel'));
  }
  else {
    next();
  }
});

// Checking if api key is correct and getting affiliation
router.param('affiliation', function(req, res, next, id) {
  req.Affiliation = req.db.get('affiliation');
  req.Affiliation.findOne({affiliation: id, api_key: req.api_key}, function(err, affiliation) {
    if(err) {
      next(err);
    }
    else if(affiliation) {
      // Affiliation and api key was correct
      req.affiliation = affiliation;
      next();
    }
    else {
      // Checking if affiliation exists to provide proper error message
      req.Affiliation.findOne({affiliation: id}, function(err, affiliation) {
        if(affiliation) {
          next(new Error('Feil apinøkkel'));
        }
        else {
          next(new Error('Fant ikke linjeforening'));
        }
      });
    }
  });
});

// Coffee endpoint
router.post('/:affiliation/coffee', function(req, res) {
  var coffee = req.db.get('coffee');
  // Add new coffee
  coffee.insert({
    affiliation: req.affiliation.affiliation,
    brewed: new Date() // now
  });
  var coffee = new Coffee();
  coffee.get(req, req.params.affiliation, function(data) {
    req.io.emit('coffee', data);
  });
  res.json({success: true});
});

// Status endpoint. Typically status if the office is open or not
router.post('/:affiliation/status', function(req, res) {
  var status = req.body.status;
  if(status === undefined || !status.match(/^(true|false)$/i)) {
    res.json({error: 'Mangler lysstatus'});
  }
  var statusDb = req.db.get('status');
  // Adding status
  statusDb.insert({
    affiliation: req.affiliation.affiliation,
    status: status.toLowerCase() === 'true',
    updated: new Date()
  });
  res.json({success: true});
});



module.exports = router;
