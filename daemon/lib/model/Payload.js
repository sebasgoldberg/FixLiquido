const TaxService = require('../api/tax');

module.exports = class Trace{

	constructor(data){
		this.data = data;
	}
	
	getQuantity(){
		return this.data.Items[0].quantity;
	}

	getUnitPrice(){
		return this.data.Items[0].unitPrice;
	}
	
	getData(data){
		return this.data;
	}

	setGross(){
		this.data.grossOrNet = 'g';
	}
	
	isService(){
		this.data.Items[0].itemType == "S"
	}
	
}