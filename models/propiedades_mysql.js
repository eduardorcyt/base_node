var mysqlConnection = require('../adapters/mysql');

module.exports = {
        //get many items
        findMany : function(fields, where, options, callback) {
            mongoDbConnection(function(err,db) { 
                if(err) throw new Error(err);
                collection = db.collection('propiedades_activas_node');
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
                collection = db.collection('propiedades_activas_node');
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
                collection = db.collection('propiedades_activas_node');
                collection.update( query, { $set : fields  }, {upsert: false, multi: false, w: 1}, function(err, result) {
                    if(err) console.log('Error en update ', err);
                    callback(result);
                });
            });
        },
}