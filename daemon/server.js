/*eslint no-console: 0*/
"use strict";

const destination = require('./lib/destination');
destination.addThis('daemon_api');

const express = require('express');
const passport = require("passport");
const xssec = require("@sap/xssec");
const xsenv = require("@sap/xsenv");
const cfenv = require('cfenv')
const appEnv = cfenv.getAppEnv();

const log = require('./lib/log');

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

var POFixDaemonInstance = require('./lib/pofix/instance');
POFixDaemonInstance.start();

const routes = require('./lib/routes');
app.use('/', routes);

const iPort = appEnv.isLocal ? 3000: appEnv.port;
app.listen(iPort, function () {
    log.info(`Congrats, your producer app is listening on port ${iPort}!`);
});
