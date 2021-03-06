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

			let oViewModel = new JSONModel({
				pedidoAnalisar: '',
				guidSimulacao: '',
				traceData: '',
			});
			v.setModel(oViewModel,"view");

			v.setModel(new JSONModel({}),"config");

			v.setModel(new JSONModel({}),"metrics");

			try {
				await Promise.all([
					this.refreshConfig(),
					this.refreshMetrics(),
				]);
			} catch (error) {
				console.error(error);
				this.showError(`Erro ao tentar carregar as informações de inicialização: ${JSON.stringify(error)}`);
			}

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

		showInfo: function(text) {
			return new Promise( resolve => {
				MessageBox.show(
					text, {
						icon: MessageBox.Icon.INFO,
						title: 'Informção',
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
			let v = this.getView();
			let config = await this.getConfig();
			let m = v.getModel('config');
			m.setData(config);
		},

		getMetrics: async function(){
			return JSON.parse(await this.execGetRequest("/daemon/metrics/"));
		},

		refreshMetrics: async function() {
			let v = this.getView();
			let metrics = await this.getMetrics();

			metrics.pendentes = metrics.total - metrics.corrigidos;
			metrics.porcentualPendentes = Number((metrics.pendentes * 100 / metrics.total).toFixed(2))
			metrics.porcentualCorrigidos = 100 - metrics.porcentualPendentes;

			let m = v.getModel('metrics');
			m.setData(metrics);
		},

		onAtualizarMetricas: async function(oEvent){
			try {
				this.getView().setBusy(true);
				await this.refreshMetrics();
				sap.m.MessageToast.show('Metricas atualizadas com sucesso.');
			} catch (error) {
				this.showError(error);
			} finally {
				this.getView().setBusy(false);
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

		onQuoteGuid: function (oEvent) {
			let oViewData = this.getView().getModel('view').getData();
			this.openUrl(`/daemon/analysis/quote/for/guid?GUID=${oViewData.guidSimulacao}`);
		},

		processAllPromises: function(promises){

			return new Promise( resolve =>{

				if (promises.length == 0){
					resolve({
						OK: 0,
						errors: [],
					});
					return;
				}

				let resolved = 0,
				pending = promises.length,
				errors = [];

				promises.forEach(async promise => {

					try {
						await promise;
						resolved += 1;
					} catch (error) {
						errors.push(error);
					}

					pending -= 1;

					if (pending <= 0){
						resolve({
							OK: resolved,
							errors: errors,
						});
					}

				});;

			});
		},

		onRegistrarTrace: async function(oEvent) {

			try{

				this.getView().setBusy(true);

				let oViewData = this.getView().getModel('view').getData();
				let requestPromises = oViewData.traceData
					.split('\n')
					.filter(reg => reg)
					.map(reg => this.getRequestPromise('/daemon/trace/add', { data: reg }));
				
				let precessPromisesResult = await this.processAllPromises(requestPromises);
	
				await this.showInfo(`Foram criados ${precessPromisesResult.OK} registros de trace com sucesso, `+
					`e aconteceram ${precessPromisesResult.errors.length} erros.`);

				if (precessPromisesResult.errors.length > 0){
					console.error(precessPromisesResult.errors);
					await this.showError(JSON.stringify(precessPromisesResult.errors));
				}

			} finally {
				this.getView().setBusy(false);
			}

		}

	});
});