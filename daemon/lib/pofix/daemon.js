var Daemon = require('../daemon');
var POAPI = require('../api/PO');
const log = require('../log');
const Item = require('../model/POItem');
const config = require('../config');

class POFixDaemon extends Daemon{
	
	constructor(){
		super();
	}
	
	async fixPOs(){

		let pendingItemsData = await POAPI.getPendingItems(config.params.itemsByExecution);
		let pendingItems = pendingItemsData.map( data => new Item(data) );

		// @todo Promise.all(pendingItems.map(async ...)) em caso de querer executar
		// em paralelo. Cuidado com processar em paralelo itens de um mesmo pedido.
		for (let item of pendingItems){
			try{
				await item.fix()
			}catch(e){
				log.error(`Error when fixing item: ${e}`);
			}
		}

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