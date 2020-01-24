/*eslint no-console: 0*/
"use strict";

const path = require('path'),
    express = require('express'),
    cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv();

var destination = require("./destination");
const destinationService = "dest_FixLiquido";
// //const cfenv = require("cfenv");

const passport = require("passport");
const xssec = require("@sap/xssec");
const xsenv = require("@sap/xsenv");

var app = express();

//Build a JWT Strategy from the bound UAA resource
passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
	uaa: {
		tag: "xsuaa"
	}
}).uaa));

//Add Passport JWT processing
app.use(passport.initialize());

app.use(
	passport.authenticate("JWT", {
		session: false
	})
);

app.get('/', function(oReq, oRes) {
    //oRes.send("Hello");

	Promise.all([
		destination.getDestination(destinationService, "s4hc"), 
		destination.getDestination(destinationService, "taxService")]
		)
		.then( destinations => {
  			return {
  				s4hc: destinations[0],
  				taxService: destinations[1],
  			};
		})
		.then( response => {
			oRes.send(JSON.stringify(response));
		});

});


const iPort = appEnv.isLocal ? 3000: appEnv.port;
app.listen(iPort, function () {
    console.log(`Congrats, your producer app is listening on port ${iPort}!`);
});

/***************************************************************************/

// var http = require("http");
// var port = process.env.PORT || 3000;
// var destination = require("./destination");
// const destinationService = "dest_FixLiquido";
// //const cfenv = require("cfenv");
// const request = require("request");
// const FixPO = require("FixPO");

// http.createServer( function (req, res) {

// 	Promise.all([
// 		destination.getDestination(destinationService, "s4hc"), 
// 		destination.getDestination(destinationService, "taxService")]
// 		)
// 		.then( destinations => {
//   			return {
//   				s4hc: destinations[0],
//   				taxService: destinations[1],
//   			};
// 		})
// 		.then(
// 			)
// 		.then( response => {
//   			res.writeHead(200, {"Content-Type": "text/plain"});
// 			res.end(JSON.stringify(response));
// 		});

// 	/*
// 	request("https://rdfdczvnfsd7e8rcfixliquido-router.cfapps.eu10.hana.ondemand.com/s4hc/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem(PurchaseOrder='4500008792',PurchaseOrderItem='10')?$format=json"
// 		, function (error, response, body) {
//   		res.writeHead(200, {"Content-Type": "text/plain"});
// 		res.end(JSON.stringify({
// 			error: error,
// 			response: response,
// 			body: body
// 		}));
// 	});
// 	*/

// }).listen(port);

// console.log("Server listening on port %d", port);
