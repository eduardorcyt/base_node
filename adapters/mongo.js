var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
//the MongoDB connection
var connectionInstance;

//config
var dbMongo = process.env.MONGODB || 'cyt';
var dbPort = process.env.MONGOPORT || '27017';
var dbHostname = process.env.MONGOPORT || 'server200';
var mdbUrl = process.env.MONGOURL || 'mongodb://' + dbHostname + ':' + dbPort + '/' + dbMongo;

module.exports = function(callback) {
  //if already we have a connection, don't connect to database again
  if (connectionInstance) {
    callback(connectionInstance);
    return;
  }

  var db = new Db(dbMongo, new Server( dbHostname, dbPort, { auto_reconnect: true }));
  db.open(function(error, databaseConnection) {
    if (error) throw new Error(error);
    connectionInstance = databaseConnection;
    callback(databaseConnection);
  });
};