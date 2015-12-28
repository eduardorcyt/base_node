var mysql       = require('mysql');

//config
var dbMy = process.env.MYDB || 'cytn20';
var dbPort = process.env.MYPORT || '3306';
var dbUser = process.env.MYUSER || 'root';
var dbPass = process.env.MYPASS || '123qwe';
var dbHostname = process.env.MYHOST || '192.168.4.200';
var connectionInstance, connection;

module.exports = function(callback) {
    //if already we have a connection, don't connect to database again
    if (connectionInstance) {
        callback(connectionInstance);
        return;
    }
    connection = mysql.createConnection({
        host     : dbHostname,
        user     : dbUser,
        password : dbPass,
        database : dbMy,
        port     : dbPort
    });
    connection.connect(function(err){
        if (err) throw new Error(err);
        connectionInstance = connection;
        callback(connection);
    });
    
}