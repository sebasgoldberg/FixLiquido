var destination = require("../destination");
const destinationService = "dest_FixLiquido";
const log = require('../log');

class Config{

	constructor(){
		this.reload();
	}
	
	async reload(){

		this.destination = {};

		try{
			[this.destination.s4hc, this.destination.taxService] = await Promise.all([
				destination.getDestination(destinationService, "s4hc"), 
				destination.getDestination(destinationService, "taxService")]
				);
		}catch(e){
			log.error(`Error when retrieving destinations: ${JSON.stringify(e)}`);
		}

	}
	
}

let config = new Config();

module.exports = config;