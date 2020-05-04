const config = require('../config');
const HistoryAPI = require('../api/history');
const POAPI = require('../api/PO');
const TraceAPI = require('../api/trace');
const Trace = require('../model/Trace');
const NetCalculation = require('../model/NetCalculation')
const log = require('../log');

module.exports = class{

	constructor(data){
		/* data example: {
                "__metadata": {
                    "id": "https://<dominio>/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem(PurchaseOrder='4500000000',PurchaseOrderItem='10')",
                    "uri": "https://<dominio>/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem(PurchaseOrder='4500000000',PurchaseOrderItem='10')",
                    "type": "API_PURCHASEORDER_PROCESS_SRV.A_PurchaseOrderItemType"
                },
                "PurchaseOrder": "4500000000",
                "PurchaseOrderItem": "10",
                "OrderQuantity": "1.000",
				"NetPriceAmount": "1000.00",
				"NetPriceQuantity": "1"
            } */
		this.data = data;
		this.isLastFixObtained = false;
		this.lastFix = undefined;
	}
	
	async getLastFix(select){
		try{
			if (!this.isLastFixObtained)
				this.lastFix = await HistoryAPI.getLastFix(this.data.PurchaseOrder, this.data.PurchaseOrderItem, select);
			this.isLastFixObtained = true;
		}catch(e){
			log.error(`Erro ao tentar obter a ultima correção do item ${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem} do histórico.`);
			throw e;
		}
		return this.lastFix;
	}
	
	async needsFix(){
		
		let lastFix = await this.getLastFix('LiquidoCalculado');
		
		// Em caso de não ter registro de correção, significa que precisa 
		// de correção.
		if (!lastFix)
			return true;
		
		// Caso não coincida o valor atual com o valor do liquido calculado
		// na ultima correção, então o item vai precisar de correção.
		//return (lastFix.QuantidadeCalculada != this.data.OrderQuantity ||
		let precoUnitarioAnterior = Number(lastFix.LiquidoCalculado) / Number(lastFix.QuantidadeLiquidoCalculado);
		let precoUnitarioAtual = this.getUnitPrice();
		return (precoUnitarioAnterior != precoUnitarioAtual);
	
	}
	
	async setAsFixed(){
		try{
			await POAPI.setItemAsFixed(this.data.PurchaseOrder, this.data.PurchaseOrderItem);
		}catch(e){
			log.error(`Erro ao tentar marcar o item ${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem} como corrigido.`);
			throw e;
		}
	}
	
	_dateFromJsonDate(jsonDate){
		let groups = jsonDate.match(/\/Date\((?<arg>.*)\+.*\)\//).groups;
		return new Date(Number(groups.arg));
	}

	async getLastTrace(){

		let traceData;

		try{
			let lastFix = await this.getLastFix();
			let fromLastFixDatetime = lastFix && this._dateFromJsonDate(lastFix.SAP_CreatedDateTime)
			traceData = await TraceAPI.getLastTrace(this.data.PurchaseOrder, this.data.PurchaseOrderItem, fromLastFixDatetime);
		}catch(e){
			log.error(`Erro ao tentar obter o ultimo trace do item ${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem}.`);
			throw e;
		}

		if (traceData)
			return new Trace(traceData);
		return;
	}
	
	async modifyNetPrice(netPrice, netPriceQuantity){

		let sapUUID;

		// Primeiro registramos o history. É mais seguro, já que caso não consigamos
		// modificar o valor do item, em uma proxima execução será realizada a correção.
		try{

			sapUUID = await HistoryAPI.registerFix(
				this.data.PurchaseOrder,
				this.data.PurchaseOrderItem,
				this.trace.getGUID(),
				this.data.NetPriceAmount,
				this.data.NetPriceQuantity,
				this.data.OrderQuantity,
				netPrice,
				netPriceQuantity,
				this.data.OrderQuantity
				);

			log.debug(`Historico de correção para o item `+
				`${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem} com o SAP_UUID `+
				`"guid'${sapUUID}'", criado com sucesso.`);

		}catch(e){
			log.error(`Erro ao tentar registrar o historico de correção para o item ${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem}.`);
			throw e;
		}

		try{
			await POAPI.fixNetPrice(
				this.data.PurchaseOrder,
				this.data.PurchaseOrderItem,
				netPrice,
				netPriceQuantity
				);
		}catch(e){
			log.error(`Erro ao tentar corrigir o valor do item ${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem}.`);

			try {

				await HistoryAPI.delete(sapUUID);

				log.debug(`Historico de correção para o item `+
					`${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem} com o SAP_UUID `+
					`"guid'${sapUUID}'", eliminado com sucesso.`);

			} catch (error) {

				log.error(`Erro ao tentar eliminar o historico de correção para o item `+
					`${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem} com o SAP_UUID `+
					`"guid'${sapUUID}'": ${JSON.stringify(error)}`);

			}

			throw e;
		}

	}
	
	async applyFix(payload){
		const netPriceQuantity = 100;
		let netCalculation = new NetCalculation(payload);
		let netUnitPrice = (await netCalculation.getNetUnitPrice()).netUnitPrice;
		await this.modifyNetPrice(netUnitPrice*netPriceQuantity, netPriceQuantity);
	}
	
	async fix(){
		
		// Em caso de não precisar de correção...
		if (!(await this.needsFix())){
			// Atualizamos o item como corrigido.
			await this.setAsFixed()
			log.info(`PO item ${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem} `+
				`não precisava de correção. Foi marcado como corrigido.`);
			return;
		}
		
		this.trace = await this.getLastTrace();
		
		// En caso de não obter nenhum trace.
		if (!this.trace){
			// Não fazemos nada, já que ainda a API de trace deveria
			// ser atualizada.
			log.warn(`Não foram obtidas informações de trace para o PO item `+
				`${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem}. `+
				`Não sera aplicada correção por enquanto.`);
			return;
		}

		let payload = await this.trace.getPayload();

		if (!this.payloadAtualizado(payload)){
			// Não fazemos nada, já que ainda a API de trace deveria
			// ser atualizada.
			log.warn(`Informações de trace desatualizadas para o PO item `+
				`${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem}. `+
				`Não sera aplicada correção por enquanto.`);

			return;
		}

		await this.applyFix(payload);
		
		log.info(`PO item ${this.data.PurchaseOrder} ${this.data.PurchaseOrderItem} corrigido com sucesso.`);
	}

	payloadAtualizado(payload){

		// Verifica se o valor do payload coincide com o valor do item...
		return (
			( Number(payload.getQuantity()) == Number(this.data.OrderQuantity) ) &&
			( ( Math.abs( Number(payload.getUnitPrice()) - this.getUnitPrice() ) ) < 0.01 )
		);

	}

	getUnitPrice(){
		return Number(this.data.NetPriceAmount) / Number(this.data.NetPriceQuantity)
	}
}