var MongoClient = require('mongodb').MongoClient;
var connection = null;
//config
var dbMongo = process.env.MONGODB || 'cyt';
var dbPort = process.env.MONGOPORT || '27017';
var dbHostname = process.env.MONGOPORT || 'server200';
var mdbUrl = process.env.MONGOURL || 'mongodb://' + dbHostname + ':' + dbPort + '/' + dbMongo;

module.exports = function getConnection(callback) {
    if (connection) {
        callback(null, connection);
    } else {
        MongoClient.connect(mdbUrl,function(err,db){
            if(err)
                console.log("Error creating new connection " + err);
            else
            {
                connection = db;
                console.log("created new connection");
            }
            callback(err,connection);
            return;
        });
    }
}