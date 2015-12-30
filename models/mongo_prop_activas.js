var mongoDbConnection = require('../adapters/mongo_adapter.js');
var Crud = require('../objects/mongo_crud.js');
var util = require("util");
var collName = 'propiedades_activas_node';
//creamos la nueva clase que va heredar la estructura del crud
function PropsActivas(collection){
    Crud.call(this, collection);
}
// heredamos la base del crud
util.inherits(PropsActivas, Crud);

var Props = new PropsActivas(collName);
module.exports = Props;