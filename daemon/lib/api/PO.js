var rp = require('request-promise');
var destination = require("../../destination");
const destinationService = "dest_FixLiquido";

let API = class {

	constructor(){
		this._ready = false;
		destination.getDestination(destinationService, "s4hc")
			.then( dest => {
				this.s4hc = dest;
				this._ready = true;
			})
			.catch( e => console.error(`Error when retrieving S4HC destination: ${JSON.stringify(e)}`) );
	}
	
	ready(){
		return this._ready;
	}
	
	async getPendingPOs(){
		var options = {
		    uri: `${this.s4hc.URL}/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem`,
		    qs: {
		    	'$format': 'json',
		    	'$select': 'PurchaseOrder,PurchaseOrderItem,OrderQuantity,NetPriceAmount',
		    	'$filter': 'YY1_PrecoLiqCorrigido_PDI eq false',
		    	'$top': '10',
		    },
			auth: {
				user: this.s4hc.User,
				pass: this.s4hc.Password,
			},
		    // headers: {
		    //     'Authorization': 'Basic ' + Buffer.from(`${this.s4hc.User}:${this.s4hc.Password}`).toString('base64'),
		    // },
		    json: true // Automatically parses the JSON string in the response
		};

		let body = await rp(options);
		
		return body.d.results
	}
}

module.exports = API;