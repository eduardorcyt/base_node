var mongoDbConnection = require('./adapters/mongo.js');

module.exports = {
        //get many items
        findMany : function(query, projection, options, callback) {
            mongoDbConnection(function(databaseConnection) {
                databaseConnection.collection('propiedades_activas_node', function(err, collection) {
                    if(err) console.log('Error en la colección: ' + err);
                    collection.find( query, projection, options ).toArray(function(err, results) {
                        if(err) console.log('Error en findMany ', err);
                        callback(results);
                    });
                });
            });
        },
        //get one item
        findOne : function(query, projection, callback) {
            mongoDbConnection(function(databaseConnection) {
                databaseConnection.collection('propiedades_activas_node', function(err, collection) {
                    if(err) console.log('Error en la colección: ' + err);
                    collection.findOne( query, projection, function(err, item) {
                        if(err) console.log('Error en findOne ', err);
                        callback(item);
                    });
                });
            });
        },
        //update one item
        updateOne : function(fields, query, callback) {
            mongoDbConnection(function(databaseConnection) {
                databaseConnection.collection('propiedades_activas_node', function(err, collection) {
                    if(err) console.log('Error en la colección: ' + err);
                    collection.update( query, { $set : fields  }, {upsert: false, multi: false, w: 1}, function(err, result) {
                        if(err) console.log('Error en update ', err);
                        callback(result);
                    });
                });
            });
        },
}


