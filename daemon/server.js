/*eslint no-console: 0*/
"use strict";

const express = require('express');
const passport = require("passport");
const xssec = require("@sap/xssec");
const xsenv = require("@sap/xsenv");
const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv();

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

var POFixDaemon = new require('./lib/pofix/daemon');
var POFixDaemonInstance = new POFixDaemon();

app.get('/start', function(oReq, oRes) {
	
	POFixDaemonInstance.start();

	oRes.send('Ativado');

});

app.get('/stop', function(oReq, oRes) {
	
	// active = false;

	POFixDaemonInstance.stop();

	oRes.send('Desativado');

});

const config = require('./lib/config');

app.get('/config/reload', function(oReq, oRes) {
	
	config.reload();
	

	oRes.send('Reloaded');

});

app.get('/params/set', function(oReq, oRes) {
	
	if (oReq.query.sleepMilliseconds)
		POFixDaemonInstance.setSleepMilliseconds(Number(oReq.query.sleepMilliseconds));

	if (oReq.query.itemsByExecution)
		config.params.itemsByExecution = Number(oReq.query.itemsByExecution);

	oRes.send('Modified');

});

app.get('/params/get', function(oReq, oRes) {
	
	oRes.send(JSON.stringify({
		sleepMilliseconds: POFixDaemonInstance.sleepMilliseconds,
		itemsByExecution: config.params.itemsByExecution,
	}));

});

const iPort = appEnv.isLocal ? 3000: appEnv.port;
app.listen(iPort, function () {
    console.log(`Congrats, your producer app is listening on port ${iPort}!`);
});
