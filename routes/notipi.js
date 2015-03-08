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
  // Add new coffee
  req.Affiliation.update(
    {affiliation: req.affiliation.affiliation},
    {
      $push: {
        coffee: {
          brewed: new Date() // now
        }
      }
    }
  );
  res.json({success: true});
});

// Light endpoint
router.post('/:affiliation/light', function(req, res) {
  var light = req.body.light;
  if(light === undefined || !light.match(/^(on|off)$/)) {
    res.json({error: 'Mangler lysstatus'});
  }
  // Adding light status
  req.Affiliation.update(
    {affiliation: req.affiliation.affiliation},
    {
      $push: {
        light: {
          status: light == 'on',
          updated: new Date()
        }
      }
    }
  );
  res.json({success: true});
});



module.exports = router;
