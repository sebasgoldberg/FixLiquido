var rp = require('request-promise');
const config = require('../config');

let API = class {

	async getLastFix(Pedido, Item){
		var options = {
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_HISTORICOFIXLIQUIDOPO_CDS/YY1_HISTORICOFIXLIQUIDOPO/`,
		    qs: {
		    	'$format': 'json',
		    	'$select': 'LiquidoCalculado',
		    	'$filter': `Pedido eq '${Pedido}' and Item eq '${Item}'`,
		    	'$orderby': 'SAP_CreatedDateTime desc',
		    	'$top': '1',
		    },
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
		    json: true // Automatically parses the JSON string in the response
		};

		let body = await rp(options);
		
		return body.d.results.pop();
	}

	async getCsrfToken(){
		var options = {
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_HISTORICOFIXLIQUIDOPO_CDS/YY1_HISTORICOFIXLIQUIDOPO`,
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
			headers: {
				'X-CSRF-Token': 'Fetch'
			},
		    resolveWithFullResponse: true
		};

		let response = await rp(options);
		
		return response.headers['x-csrf-token'];
	}

	async registerFix(Pedido, Item, TraceGUID, BrutoOrigem, QuantidadeOrigem, LiquidoCalculado, QuantidadeCalculada){
		var options = {
			method: 'POST',
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_HISTORICOFIXLIQUIDOPO_CDS/YY1_HISTORICOFIXLIQUIDOPO`,
		    body: {
				Pedido: Pedido,
				Item: Item,
				TraceGUID: TraceGUID,
				BrutoOrigem: BrutoOrigem,
				QuantidadeOrigem: QuantidadeOrigem,
				LiquidoCalculado: LiquidoCalculado,
				QuantidadeCalculada: QuantidadeCalculada
		    },
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
		    json: true,
		    headers: {
		    	'x-csrf-token': await this.getCsrfToken()
		    }
		};

		await rp(options);
	}

}

module.exports = new API();