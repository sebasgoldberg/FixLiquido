var Daemon = require('../daemon');
var POAPI = require('../api/PO');
const log = require('../log');
const Item = require('../model/POItem');
const PO = require('../model/PO');
const config = require('../config');

class POFixDaemon extends Daemon{
	
	constructor(){
		super();
	}
	
	async fixPOs(){

		if (!this.active)
			return;

		let filter = 'YY1_PrecoLiqCorrigido_PDI eq false';
		if (config.params.itemsAdditionalFilters)
			filter += ` and ( ${config.params.itemsAdditionalFilters} )`;

		let pendingItemsData = await POAPI.getPendingItems(filter);
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
				log.error(`Erro ao tentar processar o item ${item.data.PurchaseOrder} ${item.data.PurchaseOrderItem}: ${e}`);
			}
		}

	}

	workflowApplies(){
		// Verificamos se existem grupos de compradores alternativos
		// definidos...
		for (let key in config.params.alternativePurchasingGroups)
			return true;
		return false;
	}

	getFilterAlternativePurchasingGroups(){
		let conditions = []
		for (let alternativePurchasingGroup in config.params.alternativePurchasingGroups)
			conditions.push(`PurchasingGroup eq '${alternativePurchasingGroup}'`)
		return `( ${conditions.join(' or ')} )`;
	}

	getPOsFromPOsData(POsData){
		return POsData.map( data => new PO(data) );
	}

	async getPendingWorkflowPOs(){

		let filter = this.getFilterAlternativePurchasingGroups();
		if (config.params.POAdditionalFilters)
			filter += ` and ( ${config.params.POAdditionalFilters} )`;

		let options = {
			'$select': 'PurchaseOrder,PurchasingGroup,to_PurchaseOrderItem/YY1_PrecoLiqCorrigido_PDI',
			'$expand': 'to_PurchaseOrderItem',
			'$filter': filter,
		}

		let workflowPOs = await POAPI.getPOs(options);
		
		return this.getPOsFromPOsData(workflowPOs).filter( PO => PO.hasAllItemsFixed() )

	}

	async gerarWorkflowPOs(){

		if (!this.active)
			return;

		if (!this.workflowApplies())
			return;

		let pendingWorkflowPOs = await this.getPendingWorkflowPOs();

		// @todo Promise.all(pendingItems.map(async ...)) em caso de querer executar
		// em paralelo. Cuidado com processar em paralelo itens de um mesmo pedido.
		for (let po of pendingWorkflowPOs){
			// Em caso que o daemon seja desativado, finalizamos a execução.
			if (!this.active)
				return;
			try{
				await po.setOriginalPurchasingGroup()
			}catch(e){
				log.error(`Erro ao tentar modificar o grupo de compradores da PO ${po.data.PurchaseOrder}: ${e}`);
			}
		}

	}

	async _runOneExecution(){
		log.info('Execução iniciada.');
		try{
			await this.fixPOs();
			await this.gerarWorkflowPOs();
		} catch(e){
			log.error(`Erro não esperado: ${JSON.stringify(e)}`);
		}
		log.info('Execução finalizada.');
	}

}

module.exports = POFixDaemon;