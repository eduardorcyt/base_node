var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var assert 		= require('assert');
var moment      = require('moment');

//models
var propsActivas = require('./models/propiedades_activas');

var jwt    = require('jsonwebtoken'); // security token
var config = require('./config'); // config file
var time_start, time_end, time_total;

app.get("/algo",function( req, res ){
    propsActivas.findMany({prp_id_propiedad: { $gt: 1038354 } },{_id: 1, prp_id_propiedad: 1, prp_id_inmobiliaria: 1}, {skip: 3,limit: 5},function(result){
         console.log(result);
         result.forEach(function(doc){
             console.log('prp_id_propiedad: ' + doc.prp_id_propiedad + ', prp_id_inmobiliaria: ' + doc.prp_id_inmobiliaria);
         });
    });
   
	res.send( 'algo' );
});

app.listen(3000);