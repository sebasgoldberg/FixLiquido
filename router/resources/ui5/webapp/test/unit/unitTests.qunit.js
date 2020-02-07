/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"jsg/fixpo/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
