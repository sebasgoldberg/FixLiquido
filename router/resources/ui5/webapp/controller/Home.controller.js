import { response } from "express";

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	"sap/m/MessageBox"
], function(Controller, formatter, MessageBox) {
	"use strict";

	return Controller.extend("jsg.fixpo.controller.App", {

		formatter: formatter,

		onInit: function () {

		},

		getRequestPromise: function(url, data) {
			return new Promise((resolve, reject) => {
				jQuery.ajax({
					url: url,
					type: 'GET',
					success: data => resolve(data),
					error: e => reject(e)
				});
			});
		},

		showError: function(text) {
			return new Promise( resolve => {
				MessageBox.show(
					text, {
						icon: MessageBox.Icon.ERROR,
						title: 'Erro',
						//actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: () => resolve()
					}
				);
			});
		},

		execGetRequest: async function(url, data) {
			let result;

			try {
				this.getView().setBusy(true);
				result = await this.getRequestPromise(url);
			} catch (error) {
				console.log(error);
				this.showError(JSON.stringify(error));
			} finally {
				this.getView().setBusy(false);
			}

			return result;
		},

		onStart: async function(oEvent) {
			let result = await this.execGetRequest('/daemon/exec/start');
			sap.m.MessageToast.show(result);
		},

		onStop: async function(oEvent) {
			let result = await this.execGetRequest('/daemon/exec/stop');
			sap.m.MessageToast.show(result);
		}
	});
});