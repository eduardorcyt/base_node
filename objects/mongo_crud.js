var mongoDbConnection = require('../adapters/mongo_adapter.js');
var collection;
module.exports = {
         setCollection: function(collection){
            this.collection = collection;
        },
        //get many items
        findMany : function(query, projection, options, callback) {
            mongoDbConnection(function(err,db) { 
                if(err) throw new Error(err);
                collection = this.collection;
                collection.find( query, projection, options ).toArray( function(err, results) {
                    if(err) throw new Error(err);
                    callback(results);
                });
            });

        },
        //get one item
        findOne : function(query, projection, callback) {
           mongoDbConnection(function(err,db) {
                if(err) throw new Error(err);
                collection = this.collection;
                collection.findOne(query, projection, function(error, results) {
                    if(error) console.log('Error en findMany ', error);
                    callback(results);
                }); 
            }); 
        },
        //update one item
        updateOne : function(fields, query, callback) {
            mongoDbConnection(function(err,db) {
                if(err) throw new Error(err);
                collection = this.collection;
                collection.update( query, { $set : fields  }, {upsert: false, multi: false, w: 1}, function(err, result) {
                    if(err) console.log('Error en update ', err);
                    callback(result);
                });
            });
        },
};