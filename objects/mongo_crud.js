var mongoDbConnection = require('../adapters/mongo_adapter.js');
function Crud(colName){
    this.findMany = function(query, projection, options, callback) {
            mongoDbConnection(function(err,db) { 
                if(err) throw new Error(err);
                var collection = db.collection(colName);
                collection.find( query, projection, options ).toArray( function(err, results) {
                    if(err) throw new Error(err);
                    callback(results);
                });
            });
    };
    this.findOne = function(query, projection, callback) {
           mongoDbConnection(function(err,db) {
                if(err) throw new Error(err);
                var collection = db.collection(colName);
                collection.findOne(query, projection, function(error, results) {
                    if(error) console.log('Error en findMany ', error);
                    callback(results);
                }); 
            });
     };
     this.updateOne = function(fields, query, callback) {
            mongoDbConnection(function(err,db) {
                if(err) throw new Error(err);
                var collection = db.collection(colName);
                collection.update( query, { $set : fields  }, {upsert: false, multi: false, w: 1}, function(err, result) {
                    if(err) console.log('Error en update ', err);
                    callback(result);
                });
            });
      };
}

module.exports = Crud;