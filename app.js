"use strict";

const express = require("express"); 
const morgan = require("morgan"); 
const bodyParser  = require("body-parser"); 

const app = express(); 
const query = require("./query.js");
const invoke = require("./invoke.js");

var ID = 3; 
var aseguradoras = ["AXXA", "Mapfre"];
var policias = ["policia01", "policia02"];
const HTTP_UNAUTHORIZED = 401; 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(morgan("dev")); 

app.get("/", function(req, res){
	res.sendFile(__dirname+"/testIndex.html");
});

app.post("/login", function (req,res){
	/*
	Entrada:
	{
		"user":<algun usuario del los arreglos aseguradoras o policias>,
		"password": "no se usa"
	}
	Salida:
	{
		"tipo": "aseguradora | policia",
		"usuario": "el mismo que en la solicitud"
	}
	*/
	if (aseguradoras.indexOf(req.body.user) >= 0){
		res.send({	tipo:"aseguradora",
					usuario:req.body.user});
	}
	else if (policias.indexOf(req.body.user) >= 0){
		res.send({	tipo:"policia",
					usuario:req.body.user});
	}
	else{
		res.sendStatus(HTTP_UNAUTHORIZED);
	}
	
});

app.post("/todasPolizas", function(req, res){
	/*
	Entrada: JSON con la siguiente estructura
	{
		"tipo": "policia"
	}
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
	if (req.body.tipo == "policia"){
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
	Entrada: JSON con la siguiente estructura
	{
		"tipo": "policia | aseguradora",
		"id": "1",
		"idAseguradora" : "someIdAseg"
	}
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
	var objPol; 
	var prom = query.query("polizaPorId", [req.body.id]);
	prom.then(function(poliza){
		objPol = JSON.parse(poliza[0].toString());
		if (req.body.tipo == "policia"){
			res.send(poliza[0].toString());
		}
		else if (req.body.tipo == "aseguradora" && objPol.aseguradora.idAseguradora == req.body.idAseguradora){
			res.send(poliza[0].toString());
		}
		else{
			res.sendStatus(HTTP_UNAUTHORIZED);
		}
	});		
});

app.post("/polizasPorAseguradora", function (req, res){
	/*
	Entrada: JSON con la siguiente estructura
	{
		"tipo": "aseguradora",
		"aseguradora": "AXXA"
	}
	Salida: Ver salida de 'todasPolizas'
	*/
	if (req.body.tipo == "aseguradora"){
		var prom = query.query("polizasPorAseguradora", [req.body.aseguradora]);
		prom.then(function(poliza){
			res.send(poliza[0].toString());
		});	
	}
	else{
		res.sendStatus(HTTP_UNAUTHORIZED);
	}
	
});

app.post("/createPoliza", function(req, res){
	/*
	Entrada: JSON con la siguiente estructura
	{
		"tipo": "aseguradora",
		"create": {
			"aseguradora":{"idAseguradora":"","nombre":""},
			"automovil":{"placa":"","vin":""},
			"cliente":{"apellidoMaterno":"","apellidoPaterno":"","correo":"","nombre":"","telefono":""},
			"estatus":false,
			"fechaFin":"",
			"fechaIni":"",
			"tipo":0
		}
	}
	Salida:
	{
		"id":"string con el id de la poliza creada"
	}
	*/
	console.log(req.body);
	if (req.body.tipo == "aseguradora"){
		var poliza = req.body.create;
		poliza.id = (ID++).toString();  
		var prom = invoke.invoke("createPoliza", [JSON.stringify(poliza)]);
		prom.then(function(transactionID){
			res.send({"id":poliza.id});
		});	
	}
	else{
		res.sendStatus(HTTP_UNAUTHORIZED);
	}
	
});

app.post("/changeInfoPoliza", function(req, res){
	/*
	Entrada: JSON con la siguiente estructura
	{
		"usuario": "AXXA", 
		"tipo": "aseguradora",
		"change": {
			"aseguradora":{"idAseguradora":"","nombre":""},
			"automovil":{"placa":"","vin":""},
			"cliente":{"apellidoMaterno":"","apellidoPaterno":"","correo":"","nombre":"","telefono":""},
			"estatus":false,
			"fechaFin":"",
			"fechaIni":"",
			"id":"",
			"tipo":0
		}
	}
	Salida:
	{
		"id":"string con el id de la poliza modificada"
	}
	*/
	if(req.body.tipo == "aseguradora"){
		var poliza = req.body.change;
		if (poliza.aseguradora.nombre == req.body.usuario){
			var polizaAsString = JSON.stringify(poliza);
			var prom = invoke.invoke("changeInfoPoliza", [poliza.id, polizaAsString]);
			prom.then(function(transactionID){
				res.send({"id":poliza.id});
			});		
		}
		else{
			res.sendStatus(HTTP_UNAUTHORIZED);	
		}
		
	}
	else{
		res.sendStatus(HTTP_UNAUTHORIZED);
	}
});

var port = process.env.VCAP_APP_PORT || 4321;
app.listen(port);