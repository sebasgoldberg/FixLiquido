const TaxService = require('../api/tax');
const log = require('../log');
const Payload = require('../model/Payload');

module.exports = class Trace{

	constructor(data){
		this.data = data;
	}
	
	async getPayload(){
		let traceLog;
		
		try{
			traceLog = await TaxService.getLogFromGUID(this.data.GUID);
		}catch(e){
			log.error(`Erro ao tentar obter o log trace de calculo de impostos para o GUID ${this.data.GUID}.`);
			throw e;
		}

		return new Payload(JSON.parse(traceLog.requestPayload));
	}
	
	getGUID(){
		return this.data.GUID;
	}
	
}