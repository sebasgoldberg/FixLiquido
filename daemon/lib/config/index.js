var Destination = require("../destination");
const log = require('../log');
const PurchGroupAPI = require('../api/purch-group-map');
const FixPoUserAPI = require('../api/fix-po-user.js');


class Config{

	constructor(){
		this.reload();
		this.params = {
			itemsAdditionalFilters: '',
			POAdditionalFilters: '',
		};
	}
	
	async reload(){

		// Obtenção dos destinations.

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

		// Registro do usuario que está executando o processo.
		try {

			await FixPoUserAPI.post({
				Usuario: this.destination.s4hc.User
			}, this.destination.s4hc);

		} catch (e) {
			log.error(`Erro ao tentar registrar o usuario API do processo que realiza a correção de pedidos: ${JSON.stringify(e)}`);
		}

		// Obtenção dos grupos de compradores alternativos.

		this.params.alternativePurchasingGroups = {};

		try {

			let purchasingGroupsMap = await PurchGroupAPI.get({
				"$select": "GrupoCompraUsuario,GrupoCompraInterno"
			}, this.destination.s4hc);

			for (let purchasingGroupMap of purchasingGroupsMap){
				this.params.alternativePurchasingGroups[purchasingGroupMap.GrupoCompraUsuario] = 
					purchasingGroupMap.GrupoCompraInterno;
			}

		} catch (e) {
			log.error(`Erro ao tentar obter o mapeamento de grupo de compradores: ${JSON.stringify(e)}`);
		}

	}
	
}

let config = new Config();

module.exports = config;