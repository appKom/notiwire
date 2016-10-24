const apicache = require('apicache');
const cache = apicache.middleware;
const async = require('async');
const express = require('express');
const url = require('url');
const router = express.Router();

const Cantina = require("../libs/cantina");
const Coffee = require("../libs/coffee");
const Hackerspace = require("../libs/hackerspace");
const Status = require("../libs/status");
const Meeting = require("../libs/meeting");
const Servant = require("../libs/servant");

// Add CORS headers
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/affiliation/:affiliation', cache('1 hour'), (req, res) => {
  req.apicacheGroup = `affiliation_${req.params.affiliation}`;
  async.parallel([
    callback => {
      const meeting = new Meeting();
      meeting.get(req.params.affiliation, data => {
        callback(null, {name: 'meeting', value: data});
      });
    },
    callback => {
      const servant = new Servant();
      servant.get(req.params.affiliation, data => {
        callback(null, {name: "servant", value: data});
      });
    },
    callback => {
      Coffee.get(req, req.params.affiliation)
      .catch(error =>  ({ error }))
      .then(data => {
        callback(null, {name: 'coffee', value: data});
      });
    },
    callback => {
      const status = new Status();
      status.get(req, req.params.affiliation, data => {
        callback(null, {name: 'status', value: data});
      });
    }
    ],
    (err, results) => {
      const data = {};
      results.forEach(result => {
        data[result.name] = result.value;
      });
      res.json(data);
    }
    );
});

router.get('/coffee/:affiliation', cache('1 hour'), (req, res) => {
  const limit = Math.round(Number(req.query.limit, 10)) || undefined;
  Coffee.getAll(req, req.params.affiliation, limit)
  .catch(error =>  ({ error }))
  .then(data => {
    res.json(data);
  });
});

router.get('/hackerspace', cache('1 minute'), (req, res) => {
  Hackerspace.get()
  .catch(error => ({ error }))
  .then(data => {
    res.json(data);
  });
});

router.get('/cantina/:location', cache('1 hour'), (req, res) => {
  const cantina = new Cantina();
  cantina.get(req.params.location, data => {
    res.json(data);
  });
});

router.get('/cantina/', cache('12 hour'), (req, res) => {
  const cantina = new Cantina();
  cantina.all(cantinas => {
    res.json(cantinas);
  });
});

module.exports = router;
