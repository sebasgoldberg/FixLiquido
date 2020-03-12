var rp = require('request-promise');
const config = require('../config');

let API = class {

	async getLastFix(Pedido, Item, select){
		var options = {
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_HISTORICOFIXLIQUIDOPO_CDS/YY1_HISTORICOFIXLIQUIDOPO/`,
		    qs: {
		    	'$format': 'json',
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

		if (select)
			options['$select'] = select

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
		
		return {
			csrfToken: response.headers['x-csrf-token'],
			setCookie: response.headers['set-cookie'].join('; '),
		};
	}

	async registerFix(Pedido, Item, TraceGUID, BrutoOrigem, QuantidadeBrutoOrigem, QuantidadeOrigem, LiquidoCalculado, QuantidadeLiquidoCalculado, QuantidadeCalculada){
		
		let csrfTokenData = await this.getCsrfToken()
		
		var options = {
			method: 'POST',
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_HISTORICOFIXLIQUIDOPO_CDS/YY1_HISTORICOFIXLIQUIDOPO`,
		    body: {
				Pedido: Pedido,
				Item: Item,
				TraceGUID: TraceGUID,
				BrutoOrigem: BrutoOrigem.toString(),
				QuantidadeBrutoOrigem: QuantidadeBrutoOrigem.toString(),
				QuantidadeOrigem: QuantidadeOrigem.toString(),
				LiquidoCalculado: LiquidoCalculado.toString(),
				QuantidadeLiquidoCalculado: QuantidadeLiquidoCalculado.toString(),
				QuantidadeCalculada: QuantidadeCalculada.toString()
		    },
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
		    json: true,
		    headers: {
		    	'x-csrf-token': csrfTokenData.csrfToken,
		    	'Cookie': csrfTokenData.setCookie,
		    }
		};

		let body = await rp(options);

		return body.d.SAP_UUID;
	}

	async delete(guid){
		
		let csrfTokenData = await this.getCsrfToken()
		
		var options = {
			method: 'DELETE',
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_HISTORICOFIXLIQUIDOPO_CDS/YY1_HISTORICOFIXLIQUIDOPO(guid'${guid}')`,
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
		    json: true,
		    headers: {
		    	'x-csrf-token': csrfTokenData.csrfToken,
		    	'Cookie': csrfTokenData.setCookie,
		    }
		};

		await rp(options);
	}

}

module.exports = new API();