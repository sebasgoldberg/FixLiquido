/*eslint no-console: 0*/
"use strict";

const Destination = require('./lib/destination');

const express = require('express');
const passport = require("passport");
const xssec = require("@sap/xssec");
const xsenv = require("@sap/xsenv");
const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv();

const log = require('./lib/log');

log.setLoggingLevel('debug');

log.setSinkFunction(function(level, output) {
	console[level](output);
});

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

const routes = require('./lib/routes');
app.use('/', routes);

const iPort = appEnv.port ? appEnv.port : 3000;
app.listen(iPort, function () {
    log.debug(`App iniciada na porta ${iPort}!`);
});

if (!appEnv.isLocal){
	let destination = new Destination();
	destination.addThis('daemon_api');
}
