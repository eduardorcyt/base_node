var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var assert 		= require('assert');
var moment      = require('moment');

var jwt    = require('jsonwebtoken'); // security token
var config = require('./config'); // config file
var time_start, time_end, time_total;

// Database configuration MySQL MongoDB
var port = process.env.PORT || 8080;
var dbMysql = process.env.dbName || 'cytn20_respaldo';
var dbMongo = process.env.dbMongo || 'cyt';
var mdbUrl = process.env.mdbUrl || 'mongodb://server200:27017/' + dbMongo;

var contador = 0;

// MongoDB conection
var db =  MongoClient.connect(mdbUrl);

//MySQL conection
var connection = mysql.createConnection({
  host     : '192.168.4.200',
  user     : 'root',
  password : '123qwe',
  database : dbMysql,
  port     : 3306
});

connection.connect(function(err){
	if(!err) {
		console.log("Conectado a MySQL...");    
	} else {
		console.log("Error conectando a MySQL");    
	}
});

app.get("/",function(req,res){
	res.send( 'Procesos' );
});

var ultimaFecha = function(){
    MongoClient.connect(mdbUrl, function(err, db) {
        // Create a collection we want to drop later
        db.collection('propiedades_activas_node').aggregate([
            {$project: {
                prp_fecha_actualizacion: 1
                }
            },
            {
                $sort : {
                    prp_fecha_actualizacion: 1
                }
            },
            {
                $group: {
                    _id: '$prp_id_propiedad', 
                    ultimaFecha: {
                        $last: '$prp_fecha_actualizacion'
                    } 
                }
            }
        ]).each(function(err, doc) {
            if(doc) {
                db.collection('logs_fechas').insert({ _id: 'activas', date: doc.ultimaFecha }, function(err, result){
                    if (err) console.log('Error al intentar insertar la fecha en MongoDB ' + err);
                    res.send( 'Fecha: ' +  moment(doc.ultimaFecha).format('YYYY-MM-DD'));
                });
            }
        });
    });
}

function loopMysql(total, loop, contar, fecha){
	contar = contar === undefined?0:contar;
	if( total > 0 && loop > 0){
		if( contar <= total ){
				connection.query('SELECT propiedades.*, propfraccionamientos.pfr_id_propiedad, tipospropiedades.*,promotores.*, inmobiliarias.*, fraccionamientos.*, propfraccionamientos.*,ubi_id_ubicacion, ubi_calle, ubi_numero_ext, ubi_interior, ubi_latitud, ubi_longitud, est_nombre, est_num_estado, col_id_colonia, col_nombre, mun_nombre, mun_mun_inegi FROM propiedades LEFT JOIN ubicaciones ON (ubi_id_ubicacion = prp_id_ubicacion) LEFT JOIN estados ON (est_num_estado = ubi_estado) LEFT JOIN municipios ON (mun_id_estado = ubi_estado AND mun_mun_inegi = ubi_municipio) LEFT JOIN colonias ON (col_id_colonia = ubi_colonia)  LEFT JOIN propfraccionamientos ON (pfr_id_propiedad = prp_id_propiedad) LEFT JOIN fraccionamientos ON (fra_id_fraccionamiento = pfr_id_fraccionamiento) LEFT JOIN propatributosv ON ( pav_id_propiedad = prp_id_propiedad AND pav_id_atributo = 18 ) LEFT JOIN inmobiliarias ON (inm_id_inmobiliaria = prp_id_inmobiliaria) INNER JOIN tipospropiedades ON (tpr_id_tipoprop = prp_tipo) INNER JOIN promotores ON (pro_id_promotor = prp_id_promotor) WHERE prp_publicada = 1 AND prp_status = "c" AND prp_fecha_actualizacion > "' + fecha + '" GROUP BY prp_id_propiedad limit 1  offset ' + contar, function(err, rows, fields) {
				if (err) console.log('Error en una propiedad');
                if (!rows){
                    contar++;
                    loopMysql(total, loop, contar);
                } else {
                    console.log('Procesando propiedad: ' + rows[0].prp_id_propiedad);
                    MongoClient.connect(mdbUrl, function(err, db) {
                        // Create a collection we want to drop later
                        var collection = db.collection('propiedades_activas_node');
                        // verificamos si la propiedad tiene descripcion como atributo para completar los datos                  
                        if( rows[0].pav_valor !== null ){
                            rows[0].prp_descripcion = rows[0].pav_valor;
                        }
                        //verificamos si la propiedad tiene ubicacion para obtener sus datos
                        if( rows[0].prp_id_ubicacion !== null){
                            if( rows[0].ubi_id_ubicacion !== null){
                                rows[0].prp_calle = rows[0].ubi_calle;
                                rows[0].prp_numero_ext = rows[0].ubi_numero_ext;
                                rows[0].prp_numero_int = rows[0].ubi_interior;
                                rows[0].prp_longitud = rows[0].ubi_longitud;
                                rows[0].ubi_latitud = rows[0].ubi_latitud;
                            }
                        }
                        //set location GeoJSON format
                        rows[0].prp_location = { type: "Point", coordinates: [ rows[0].prp_longitud, rows[0].prp_latitud ] };
                        // Insert to mongodb 
                        collection.insert(rows[0], function(err, result){
                            if (err) console.log('Error al intentar insertar la propiedad ' + rows[0].prp_id_propiedad + ' en MongoDB ' + err);
                            console.log('La propiedad ' + rows[0].prp_id_propiedad + ' guardada en MongoDB!');
                        });
                        db.close();
                    });
                    contar++;
                    console.log('Van: ' + contar);
                }
				loopMysql(total, loop, contar);
			});	
		}else{
            time_end = moment();
            time_total = time_start.diff(time_end);
			console.log('FIN, Se insertaron: ' + contar + ' propiedades! con una duración de: ' + time_total);
            //debemos guardar la ultima fecha de actualizacion de las propiedades
            ultimaFecha();
			return false;
		}
	}else{
		console.log('No hay registros');
		return false;
	}
}

app.get("/aggregate",function(req,res){
     MongoClient.connect(mdbUrl, function(err, db) {
        // Create a collection we want to drop later
        db.collection('propiedades_activas_node').aggregate([
            {$project: {
                prp_fecha_actualizacion: 1
                }
            },
            {
                $sort : {
                    prp_fecha_actualizacion: 1
                }
            },
            {
                $group: {
                    _id: '$prp_id_propiedad', 
                    ultimaFecha: {
                        $last: '$prp_fecha_actualizacion'
                    } 
                }
            }
        ]).each(function(err, doc) {
            if(err) console.log(err);
            if(doc) {
                // Got a document, terminate the each
                console.log(doc.ultimaFecha);
                res.send( 'Fecha: ' +  moment(doc.ultimaFecha).format('YYYY-MM-DD'));
                db.collection('logs_fechas').insert({ _id: 'activas', date: doc.ultimaFecha }, function(err, result){
                    if (err) console.log('Error al intentar insertar la fecha en MongoDB ' + err);
                    res.send( 'Fecha: ' +  moment(doc.ultimaFecha).format('YYYY-MM-DD'));
                });
                db.close();
            }
        });
    });
});

app.get("/feedGen",function(req,res){
	var total, loop, paginas, ultima, contador = 0;

	connection.query('SELECT SQL_CALC_FOUND_ROWS propiedades.* FROM propiedades INNER JOIN tipospropiedades ON (tpr_id_tipoprop = prp_tipo) INNER JOIN promotores ON (pro_id_promotor = prp_id_promotor) WHERE prp_publicada = 1 AND prp_status = "c" GROUP BY prp_id_propiedad LIMIT 1', function(err, rows, fields) {
		if (err) throw err;
		connection.query('SELECT FOUND_ROWS() as total_rows', function(err, rows, fields) {
			if (err) throw err;
			console.log('Total: ', rows[0].total_rows);
			total = parseInt(rows[0].total_rows);
			loop = Math.ceil( total/100 );
			console.log('Vueltas: ' + loop);
            time_start = moment();
            //obtenemos la ultima fecha procesada desde mongo:
             MongoClient.connect(mdbUrl, function(err, db) {
                // Create a collection we want to drop later
                db.collection('logs_fechas').findOne({ _id: 'activas' }, function(err, item) {
                    if (err) console.log('Error al obtener ultima fecha en MongoDB ' + err);
                    console.dir(item);
                    if( !item ){
                        ultima = '1990-01-01';
                    } else {
                        ultima = moment(item.date).format('YYYY-MM-DD h:mm:ss');
                    }
                    db.close();
                    res.send('Proceso de migración de propiedades de MySQL a MongoDB, con fecha: ' + ultima );
                    // invocamos la función para procesar las propiedades      
                    loopMysql(total, loop, contador, ultima);
                })
             });
		});
	});
});

app.listen(3000);