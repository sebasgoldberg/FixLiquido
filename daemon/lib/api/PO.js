var rp = require('request-promise');
const config = require('../config');

let API = class {

	constructor(){
		this.POODataPath = '/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV';
	}

	async getPendingItems(){
		var options = {
		    uri: `${config.destination.s4hc.URL}${this.POODataPath}/A_PurchaseOrderItem`,
		    qs: {
		    	'$format': 'json',
		    	'$select': 'PurchaseOrder,PurchaseOrderItem,OrderQuantity,NetPriceAmount',
		    	'$filter': 'YY1_PrecoLiqCorrigido_PDI eq false',
		    	// @todo Eliminar ou criar logica de lotes.
		    	'$top': '2',
		    },
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
		    json: true // Automatically parses the JSON string in the response
		};

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
		
		return response.headers['x-csrf-token'];
	}
	
	getUrl(PurchaseOrder, PurchaseOrderItem){
		return 
			`${config.destination.s4hc.URL}${this.POODataPath}`+
			`/A_PurchaseOrderItem(PurchaseOrder='${PurchaseOrder}',PurchaseOrderItem='${PurchaseOrderItem}')`;
	}
	
	async setItemAsFixed(PurchaseOrder, PurchaseOrderItem){
		var options = {
			method: 'PATCH',
		    uri: this.getUrl(),
		    body: {
		    	YY1_PrecoLiqCorrigido_PDI: true
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

	async fixNetPrice(PurchaseOrder, PurchaseOrderItem, NetPriceAmount){
		var options = {
			method: 'PATCH',
		    uri: this.getUrl(),
		    body: {
		    	YY1_PrecoLiqCorrigido_PDI: true,
		    	NetPriceAmount: NetPriceAmount,
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