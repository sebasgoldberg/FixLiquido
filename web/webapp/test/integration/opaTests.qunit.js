/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"jsg/fix-preco-liquido/web/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});