sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"jsg/fixpo/model/formatter"
], function(Controller, formatter) {
	"use strict";

	return Controller.extend("jsg.fixpo.controller.App", {

		formatter: formatter,

		onInit: function () {

		}
	});
});