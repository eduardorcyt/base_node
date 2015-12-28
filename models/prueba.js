var mongoDbConnection = require('../adapters/mongo_adapter.js');

exports.index = function(req, res, next) {
  mongoDbConnection(function(databaseConnection) {
    databaseConnection.collection('propiedades_activas_node', function(error, collection) {
      collection.find().toArray(function(error, results) {
        next(results);
      });
    });
  });
};