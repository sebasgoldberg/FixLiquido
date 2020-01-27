const TaxService = require('../api/tax');
const log = require('../log');

module.exports = class{

	constructor(payload){
		this.payload = payload
	}

	async getNetUnitPrice(){

		payload.setGross();

		let quoteResponseBody;

		try{
			quoteResponseBody = await TaxService.quote(this.payload.getData());
		}catch(e){
			log.error("Erro ao tentar calcular os impostos");
			throw e;
		}

		let taxTypeCodes;

		if (this.payload.isService())
		    taxTypeCodes = [ "PIS", "COFINS", "ISS-EXEC-WHT", "ISS-PROV"]
		else
		    taxTypeCodes = [ "PIS", "COFINS", "ICMS", "ICMS-ST"];

		let net_value = parseFloat(quoteResponseBody.total);

		quoteResponseBody.taxLines.forEach( taxLine => {
			taxLine.taxValues.forEach( taxValue => {
		        if (taxTypeCodes.includes(taxValue.taxTypeCode)){
		            let tax = parseFloat(taxValue.value);
		            net_value = net_value - tax; 
		        }
			});
		})

		var quantity = parseFloat(this.payload.getQuantity());
		
		return net_value/quantity;

	}

}