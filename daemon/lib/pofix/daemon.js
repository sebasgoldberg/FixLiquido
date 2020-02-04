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

		let filter = 'YY1_PrecoLiqCorrigido_PDI eq false';
		if (config.params.itemsAdditionalFilters)
			filter += ` and ( ${config.params.itemsAdditionalFilters} )`;

		let pendingItemsData = await POAPI.getPendingItems(config.params.itemsByExecution, filter);
		let pendingItems = pendingItemsData.map( data => new Item(data) );

		// @todo Promise.all(pendingItems.map(async ...)) em caso de querer executar
		// em paralelo. Cuidado com processar em paralelo itens de um mesmo pedido.
		for (let item of pendingItems){
			// Em caso que o daemon seja desativado, finalizamos a execução.
			if (!this.active)
				return;
			try{
				await item.fix()
			}catch(e){
				log.error(`Erro ao tentar corrigir o item ${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem}: ${e}`);
			}
		}

	}
	
	async _runOneExecution(){
		log.info('Execução iniciada.');
		try{
			await this.fixPOs();
		} catch(e){
			log.error(e);
		}
		log.info('Execução finalizada.');
	}

}

module.exports = POFixDaemon;