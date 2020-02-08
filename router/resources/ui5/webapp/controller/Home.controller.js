import { response } from "express";

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Context"
], function(Controller, formatter, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("jsg.fixpo.controller.App", {

		formatter: formatter,

		onInit: async function () {
			let v = this.getView();

			let oConfigModel = new JSONModel({});
			v.setModel(oConfigModel,"config");
			v.byId('formConfig')

			await this.refreshConfig()

			let oViewModel = new JSONModel({
				pedidoAnalisar: '',
				guidSimulacao: '',
				traceData: '',
			});
			v.setModel(oViewModel,"view");

		},

		getRequestPromise: function(url, data) {
			return new Promise((resolve, reject) => {
				jQuery.ajax({
					url: url,
					type: 'GET',
					data: data,
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
			let error;

			try {
				this.getView().setBusy(true);
				result = await this.getRequestPromise(url, data);
			} catch (e) {
				error = e;
				console.error(error);
				this.showError(JSON.stringify(error));
			} finally {
				this.getView().setBusy(false);
			}

			if (error)
				throw error;

			return result;
		},

		onStart: async function(oEvent) {
			try {
				await this.execGetRequest('/daemon/exec/start');
				sap.m.MessageToast.show('Daemon iniciado com sucesso.');
			} catch (error) {
				
			}
		},

		onStop: async function(oEvent) {
			try {
				await this.execGetRequest('/daemon/exec/stop');
				sap.m.MessageToast.show('Daemon detido com sucesso.');
			} catch (error) {
				
			}
		},

		getConfig: async function () {
			return JSON.parse(await this.execGetRequest("/daemon/config/get/params"));
		},

		refreshConfig: async function() {
			try {
				let v = this.getView();
				let config = await this.getConfig();
				let m = v.getModel('config');
				m.setData(config);
			} catch (e) {
			} finally {
			}
		},

		onSalvarConfig: async function (oEvent) {

			let v = this.getView();
			let m = v.getModel('config');
			let config = m.getData();

			try {

				if (!config.loggingLevel)
					throw "Deve selecionar o nivel de log.";
				
				if (!/^\d+$/.test(config.sleepMilliseconds))
					throw "Selecionar um valor válido para o tempo de sleep.";

			} catch (error) {
				this.showError(error);
				return;
			}

			try {
				await this.execGetRequest("/daemon/config/set/params", config);
				sap.m.MessageToast.show('Configuração gravada com sucesso.');
			} catch (error) {
				
			}
		},

		onRecarregarConfig: async function(oEvent) {
			try {
				await this.execGetRequest("/daemon/config/set/reload");
				sap.m.MessageToast.show('Recarregamento no server realizado com sucesso.');
			} catch (error) {
				
			}
				
		},

		openUrl: function(path) {
			window.open(`${window.location.origin}${path}`, '_blank');
		},

		onAnalisarPedido: function (oEvent) {
			let oViewData = this.getView().getModel('view').getData();
			this.openUrl(`/daemon/analysis/last/state?filter=PurchaseOrder eq '${oViewData.pedidoAnalisar}'`);
		},

		onSimularGuid: function (oEvent) {
			let oViewData = this.getView().getModel('view').getData();
			this.openUrl(`/daemon/analysis/gross/calc/for/guid?GUID=${oViewData.guidSimulacao}`);
		},

	});
});