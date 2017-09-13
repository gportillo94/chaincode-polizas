"use strict";

const express = require("express"); 
const session = require("express-session");
const morgan = require("morgan"); 
const bodyParser  = require("body-parser"); 

const app = express(); 
var query = require("./query.js");
var invoke = require("./invoke.js");
var ID = 3; 
const HTTP_OK = 200; 
const HTTP_UNAUTHORIZED = 401; 

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(morgan("dev")); 

app.use(session({
  secret: "this is secret",
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 860000 },
}));

app.get("/", function(req, res){
	res.sendFile(__dirname+"/index.html");
});

app.post("/login", function (req,res){
	req.session.user = req.body.user; 
	req.session.password = req.body.password; 
	res.sendStatus(HTTP_OK);
});

app.get("/todasPolizas", function(req, res){
	/*
	Salida: Un arreglo de objetos, por ej.:
		[
			{"Key":"1", "Record":{
				"aseguradora":{"idAseguradora":"aseg01","nombre":"AXXA"},
				"automovil":{"placa":"ABC123","vin":"h0l4mund0"},
				"cliente":{"apellidoMaterno":"flores","apellidoPaterno":"portillo","correo":"","nombre":"guillermo","telefono":""},
				"estatus":false,
				"fechaFin":"2016-06-01T00:00:00Z",
				"fechaIni":"2015-01-30T00:00:00Z",
				"id":"1",
				"tipo":0}
			},
			{"Key":"2", "Record":{
				"aseguradora":{"idAseguradora":"aseg01","nombre":"AXXA"},
				"automovil":{"placa":"DEF456","vin":"h0l4mund0"},
				"cliente":{"apellidoMaterno":"zxcv","apellidoPaterno":"asdf","correo":"","nombre":"qwer","telefono":""},
				"estatus":false,
				"fechaFin":"2016-06-01T00:00:00Z",
				"fechaIni":"2015-01-30T00:00:00Z",
				"id":"2",
				"tipo":0}
			}
		]
	*/
	if (req.session.user){
		var prom = query.query("todasPolizas", []);
		prom.then(function(polizas){
			res.send(polizas[0].toString());
		});	
	}
	else{
		res.sendStatus(HTTP_UNAUTHORIZED);
	}
	
});

app.post("/polizaPorId", function (req, res){
	/*
	Entrada: {"id":"string-id"}
	Salida: Un objeto poliza, por ej.:
	{	"aseguradora":{"idAseguradora":"aseg01","nombre":"AXXA"},
		"automovil":{"placa":"ABC123","vin":"h0l4mund0"},
		"cliente":{"apellidoMaterno":"flores","apellidoPaterno":"portillo","correo":"","nombre":"guillermo","telefono":""},
		"estatus":false,
		"fechaFin":"2016-06-01T00:00:00Z",
		"fechaIni":"2015-01-30T00:00:00Z",
		"id":"1",
		"tipo":0
	}
	*/
	var prom = query.query("polizaPorId", [req.body.id]);
	prom.then(function(poliza){
		res.send(poliza[0].toString());
	});
});

app.post("/polizasPorAseguradora", function (req, res){
	/*
	Entrada: {"aseguradora":"nombre aseguradora"}
	Salida: Ver salida de 'todasPolizas'
	*/
	var prom = query.query("polizasPorAseguradora", [req.body.aseguradora]);
	prom.then(function(poliza){
		res.send(poliza[0].toString());
	});
});

app.post("/createPoliza", function(req, res){
	/*
	Entrada: JSON con la siguiente estructura
	{create:
		'{	"aseguradora":{"idAseguradora":"","nombre":""},
			"automovil":{"placa":"","vin":""},
			"cliente":{"apellidoMaterno":"","apellidoPaterno":"","correo":"","nombre":"","telefono":""},
			"estatus":false,
			"fechaFin":"",
			"fechaIni":"",
			"tipo":0
		}'
	}
	*/
	var poliza = JSON.parse(req.body.create);
	poliza.id = (ID++).toString();  
	var prom = invoke.invoke("createPoliza", [JSON.stringify(poliza)]);
	prom.then(function(transactionID){
		res.send({"id":poliza.id});
	});
});

app.post("/changeInfoPoliza", function(req, res){
	/*
	Entrada: JSON con la siguiente estructura
	{change:
		'{	"aseguradora":{"idAseguradora":"","nombre":""},
			"automovil":{"placa":"","vin":""},
			"cliente":{"apellidoMaterno":"","apellidoPaterno":"","correo":"","nombre":"","telefono":""},
			"estatus":false,
			"fechaFin":"",
			"fechaIni":"",
			"id":"",
			"tipo":0
		}'
	}
	*/
	var polizaAsString = req.body.change; 
	var poliza = JSON.parse(polizaAsString);
	var prom = invoke.invoke("changeInfoPoliza", [poliza.id, polizaAsString]);
	prom.then(function(transactionID){
		res.send({"id":poliza.id});
	});
});

var port = process.env.VCAP_APP_PORT || 1234;
app.listen(port);