const TaxService = require('../api/tax');

module.exports = class Trace{

	constructor(data){
		this.data = data;
	}
	
	async getPayload(){
		let traceLog = await TaxService.getLogFromGUID(this.data.GUID);
		return JSON.parse(traceLog.requestPayload);
	}
	
	getGUID(){
		return this.data.GUID;
	}
	
}