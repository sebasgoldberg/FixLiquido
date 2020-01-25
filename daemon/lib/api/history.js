var rp = require('request-promise');
const config = require('../config');

let API = class {

	async getLastFix(Pedido, Item){
		var options = {
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_HISTORICOFIXLIQUIDOPO_CDS/YY1_HISTORICOFIXLIQUIDOPO`,
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
}

module.exports = new API();