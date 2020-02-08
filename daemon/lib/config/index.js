var Destination = require("../destination");
const log = require('../log');
const PurchGroupAPI = require('../api/purch-group-map');

class Config{

	constructor(){
		this.reload();
		this.params = {
			itemsAdditionalFilters: '',
			POAdditionalFilters: '',
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
			log.error(`Erro ao tentar obter os destinations: ${JSON.stringify(e)}`);
		}

		this.params.alternativePurchasingGroups = {};

		try {

			let purchasingGroupsMap = await PurchGroupAPI.get({
				"$select": "GrupoCompraUsuario,GrupoCompraInterno"
			}, this.destination.s4hc);

			for (let purchasingGroupMap of purchasingGroupsMap){
				this.params.alternativePurchasingGroups[purchasingGroupMap.GrupoCompraUsuario] = 
					purchasingGroupMap.GrupoCompraInterno;
			}

		} catch (error) {
			log.error(`Erro ao tentar obter o mapeamento de grupo de compradores: ${JSON.stringify(e)}`);
		}

	}
	
}

let config = new Config();

module.exports = config;