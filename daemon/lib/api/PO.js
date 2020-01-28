var rp = require('request-promise');
const config = require('../config');

let API = class {

	constructor(){
		this.POODataPath = '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
	}

	async getPendingItems(top){
		var options = {
		    uri: `${config.destination.s4hc.URL}${this.POODataPath}/A_PurchaseOrderItem`,
		    qs: {
		    	'$format': 'json',
		    	'$select': 'PurchaseOrder,PurchaseOrderItem,OrderQuantity,NetPriceAmount',
		    	'$filter': 'YY1_PrecoLiqCorrigido_PDI eq false',
		    },
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
		    json: true // Automatically parses the JSON string in the response
		};
		
		if (top)
			options.qs['$top'] = top;

		let body = await rp(options);
		
		return body.d.results
	}
	
	async getCsrfToken(){
		var options = {
		    uri: `${config.destination.s4hc.URL}${this.POODataPath}`,
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
	
	getUrl(PurchaseOrder, PurchaseOrderItem){
		return `${config.destination.s4hc.URL}${this.POODataPath}`+
			`/A_PurchaseOrderItem(PurchaseOrder='${PurchaseOrder}',PurchaseOrderItem='${PurchaseOrderItem}')`;
	}
	
	async setItemAsFixed(PurchaseOrder, PurchaseOrderItem){

		let csrfTokenData = await this.getCsrfToken();
		
		var options = {
			method: 'PATCH',
		    uri: this.getUrl(PurchaseOrder, PurchaseOrderItem),
		    body: {
		    	YY1_PrecoLiqCorrigido_PDI: true
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

		await rp(options);
	}

	async fixNetPrice(PurchaseOrder, PurchaseOrderItem, NetPriceAmount){
		let csrfTokenData = await this.getCsrfToken();
		
		var options = {
			method: 'PATCH',
		    uri: this.getUrl(PurchaseOrder, PurchaseOrderItem),
		    body: {
		    	YY1_PrecoLiqCorrigido_PDI: true,
		    	NetPriceAmount: NetPriceAmount.toString(),
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

		await rp(options);
	}

}

module.exports = new API();