const express = require("express"); 
const morgan = require("morgan"); 
const bodyParser  = require("body-parser"); 
const app = express(); 
var query = require("./query.js");
var invoke = require("./invoke.js");

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(morgan("dev")); 


app.get("/polizaPorId", function (req, res){
	//query.query("polizaPorId", ["123"]);
});

app.get("/todasPolizas", function(req, res){
	//query.query("todasPolizas", []);

});

app.post("/createPoliza", function(req, res){
	//invoke.invoke("createPoliza", ['{"id":"123"}'])
});

app.post("/changeInfoPoliza", function(req, res){
	//invoke.invoke("changeInfoPoliza", ['123', '{"cliente":{"nombre":"guillermo", "apellidoPaterno":"portillo"}}'])
});