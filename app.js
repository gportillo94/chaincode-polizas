"use strict";

const express = require("express"); 
const morgan = require("morgan"); 
const bodyParser  = require("body-parser"); 
const app = express(); 
var query = require("./query.js");
var invoke = require("./invoke.js");
var ID = 3; 

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(morgan("dev")); 

app.get("/", function(req, res){
	res.sendFile(__dirname+"/index.html");
});

app.get("/todasPolizas", function(req, res){
	/*
	Entrada: Nada
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
	var prom = query.query("todasPolizas", []);
	prom.then(function(polizas){
		res.send(polizas[0].toString());
	});
});

app.post("/polizaPorId", function (req, res){
	/*
	Entrada: Cadena con el ID de la poliza
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
	Entrada: Cadena con el nombre de la aseguradora
	Salida: Ver salida de 'todasPolizas'
	*/
	console.log(req.body.aseguradora);
	var prom = query.query("polizasPorAseguradora", [req.body.aseguradora]);
	prom.then(function(poliza){
		res.send(poliza[0].toString());
	});
});

app.post("/createPoliza", function(req, res){
	/*
	Entrada: Una cadena con el siguiente formato JSON. Sin la propiedad id!!!!
		{	"aseguradora":{"idAseguradora":"","nombre":""},
			"automovil":{"placa":"","vin":""},
			"cliente":{"apellidoMaterno":"","apellidoPaterno":"","correo":"","nombre":"","telefono":""},
			"estatus":false,
			"fechaFin":"",
			"fechaIni":"",
			"tipo":0
		}
	*/
	var poliza = JSON.parse(req.body.create);
	poliza.id = (ID++).toString();  
	var prom = invoke.invoke("createPoliza", [JSON.stringify(poliza)]);
	prom.then(function(transactionID){
		res.send(transactionID);
	});
});

app.post("/changeInfoPoliza", function(req, res){
	/*
	Entrada: Una cadena con el siguiente formato JSON.
		{	"aseguradora":{"idAseguradora":"","nombre":""},
			"automovil":{"placa":"","vin":""},
			"cliente":{"apellidoMaterno":"","apellidoPaterno":"","correo":"","nombre":"","telefono":""},
			"estatus":false,
			"fechaFin":"",
			"fechaIni":"",
			"id":"",
			"tipo":0
		}
	*/
	var polizaAsString = req.body.change; 
	var poliza = JSON.parse(polizaAsString);
	var prom = invoke.invoke("changeInfoPoliza", [poliza.id, polizaAsString]);
	prom.then(function(transactionID){
		res.send(transactionID);
	});
});

var port = process.env.VCAP_APP_PORT || 3333;
app.listen(port);