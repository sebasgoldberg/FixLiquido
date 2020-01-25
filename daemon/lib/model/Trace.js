const TaxService = require('../api/tax');

module.exports = class Trace{

	constructor(data){
		this.data = data;
	}
	
	static async create(data){
		let trace = new Trace(data);
		await this.fetchPayload();
		return trace;
	}

	async fetchPayload(){
		let log = await TaxService.getLogFromGUID(this.data.GUID);
		this.payload = JSON.parse(log.requestPayload);
	}
	
	getQuantity(){
		return this.payload.Items[0].quantity;
	}

	getUnitPrice(){
		return this.payload.Items[0].unitPrice;
	}

	setGross(){
		this.payload.grossOrNet = 'g';
	}
	
	async recalculateTaxes(){
		return await TaxService.quote(this.payload);
	}

}