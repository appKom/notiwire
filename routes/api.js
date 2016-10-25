const apicache = require('apicache');
const debug = require('debug')('api');
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

const getDataSources = (req) => {
  const affiliation = req.params.affiliation;
  const sources = [
    {
      name: 'meeting',
      promise: Meeting.get(affiliation)
    },
    {
      name: 'servant',
      promise: Servant.get(affiliation)
    },
    {
      name: 'coffee',
      promise: Coffee.get(req, affiliation)
    },
    {
      name: 'status',
      promise: Status.get(req, affiliation)
    }
  ];
  const sourcesWithCatchHandled = sources.map(source => {
    return source.promise
    .catch(error => ({ error }))
    .then(data => ({ name: source.name, value: data }));
  })
  return sourcesWithCatchHandled;
}

const reduceResultsToObject = results => (
  results.reduce(
    (data, result) => {
      data[result.name] = result.value;
      return data;
    },
    // Initial value
    {}
  )
);

router.get('/affiliation/:affiliation', cache('1 hour'), (req, res) => {
  req.apicacheGroup = `affiliation_${req.params.affiliation}`;
  // Wait for all promises to finish and then return the results
  Promise.all(getDataSources(req))
  .then(results => {
    res.json(reduceResultsToObject(results));
  })
  .catch(error => {
    debug('An error happened while processing results', error);
    res.json(new Error('En feil skjedde'));
  });
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
