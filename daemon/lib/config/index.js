var destination = require("../destination");
const destinationService = "dest_FixLiquido";
const log = require('../log');

class Config{

	constructor(){
		this.reload();
		this.params = {
			itemsByExecution: 0,
			itemsAdditionalFilters: '',
		};
	}
	
	async reload(){

		this.destination = {};

		try{
			[this.destination.s4hc, this.destination.taxService] = await Promise.all([
				destination.getDestination(destinationService, "s4hc"), 
				// @todo Mudar para taxService
				destination.getDestination(destinationService, "taxServiceToken")]
				);
		}catch(e){
			log.error(`Error when retrieving destinations: ${JSON.stringify(e)}`);
		}

	}
	
}

let config = new Config();

module.exports = config;