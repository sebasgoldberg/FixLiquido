var Destination = require("../destination");
const log = require('../log');

class Config{

	constructor(){
		this.reload();
		this.params = {
			itemsByExecution: 0,
			itemsAdditionalFilters: '',
			alternativePurchasingGroups: { 101: '001' },
		};
	}
	
	async reload(){

		this.destination = {};

		let destination = new Destination();

		try{
			[this.destination.s4hc, this.destination.taxService] = await Promise.all([
				destination.getDestination("s4hc"), 
				// @todo Mudar para taxService
				destination.getDestination("taxServiceToken")]
				);
		}catch(e){
			log.error(`Error when retrieving destinations: ${JSON.stringify(e)}`);
		}

	}
	
}

let config = new Config();

module.exports = config;