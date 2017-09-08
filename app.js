"use strict";

const express = require("express"); 
const morgan = require("morgan"); 
const bodyParser  = require("body-parser"); 
const app = express(); 
var query = require("./query.js");
var invoke = require("./invoke.js");

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(morgan("dev")); 

app.get("/", function(req, res){
	res.sendFile(__dirname+"/index.html");
});

app.get("/todasPolizas", function(req, res){
	var prom = query.query("todasPolizas", []);
	prom.then(function(polizas){
		res.send(polizas[0].toString());
	});
});

app.post("/polizaPorId", function (req, res){
	var prom = query.query("polizaPorId", [req.body.id]);
	prom.then(function(poliza){
		res.send(poliza[0].toString());
	});
});

app.post("/polizasPorAseguradora", function (req, res){
	console.log(req.body.aseguradora);
	var prom = query.query("polizasPorAseguradora", [req.body.aseguradora]);
	prom.then(function(poliza){
		res.send(poliza[0].toString());
	});
});

app.post("/createPoliza", function(req, res){
	var polizaAsString = req.body.create;
	var prom = invoke.invoke("createPoliza", [polizaAsString])
	prom.then(function(transactionID){
		res.send(transactionID);
	});
});

app.post("/changeInfoPoliza", function(req, res){
	var polizaAsString = req.body.change; 
	var poliza = JSON.parse(polizaAsString);
	var prom = invoke.invoke("changeInfoPoliza", [poliza.id, polizaAsString]);
	prom.then(function(transactionID){
		res.send(transactionID);
	});
});

var port = process.env.VCAP_APP_PORT || 3333;
app.listen(port);