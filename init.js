const monk = require('monk');

const  addAffiliationWithData = async (db, affiliationName, key) => {
  const affiliationDb = db.get('affiliation');
  const statusDb = db.get('status');
  const coffee = db.get('coffee');

  await affiliationDb.insert({
    affiliation: affiliationName,
    api_key: key,    
  });

  await coffee.insert({
    affiliation: affiliationName,
    brewed: new Date()
  });

  await statusDb.insert({
    affiliation: affiliationName,
    status: true,
    updated: new Date()
  });
  db.close();
  process.exit(0);
}

monk('localhost/notiwire').then((db) => {
  addAffiliationWithData(db, 'DEBUG', 'debug_key');
});
