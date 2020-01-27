const TaxService = require('../api/tax');
const log = require('../log');

module.exports = class Trace{

	constructor(data){
		this.data = data;
	}
	
	async getPayload(){
		let traceLog;
		
		try{
			traceLog = await TaxService.getLogFromGUID(this.data.GUID);
		}catch(e){
			log.error("Erro ao tentar obter o log trace de calculo de impostos para o GUID.");
			throw e;
		}

		return JSON.parse(traceLog.requestPayload);
	}
	
	getGUID(){
		return this.data.GUID;
	}
	
}