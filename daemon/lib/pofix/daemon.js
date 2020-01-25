var Daemon = require('../daemon');
var POAPI = require('../api/PO');
const log = require('../log');
const Item = require('../model/POItem');

class POFixDaemon extends Daemon{
	
	constructor(){
		super();
	}
	
	async fixPOs(){
		let pendingItems = await POAPI.getPendingItems();
		pendingItems
			.map( data => new Item(data) )
			.forEach( item => {
				try{
					await item.fix()
				}catch(e){
					log.error(`Error when fixing item: ${JSON.stringify(e)}`);
				}
			})
	}
	
	async _runOneExecution(){
		log.log('Execution begins.');
		try{
			await this.fixPOs();
		} catch(e){
			log.error(e);
		}
		log.log('Execution end.');
	}

}

module.exports = POFixDaemon;