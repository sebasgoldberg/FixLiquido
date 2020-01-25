const config = require('../config');
const HistoryAPI = require('../api/history');
const POAPI = require('../api/PO');
const TraceAPI = require('../api/trace');
const Trace = require('../model/Trace');

module.exports = class{

	constructor(data){
		/* data example: {
                "__metadata": {
                    "id": "https://my303734.s4hana.ondemand.com:443/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem(PurchaseOrder='4500000000',PurchaseOrderItem='10')",
                    "uri": "https://my303734.s4hana.ondemand.com:443/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem(PurchaseOrder='4500000000',PurchaseOrderItem='10')",
                    "type": "API_PURCHASEORDER_PROCESS_SRV.A_PurchaseOrderItemType"
                },
                "PurchaseOrder": "4500000000",
                "PurchaseOrderItem": "10",
                "OrderQuantity": "1.000",
                "NetPriceAmount": "1000.00"
            } */
		this.data = data;
	}
	
	async getLastFix(){
		return await HistoryAPI.getLastFix(this.data.PurchaseOrder, this.data.PurchaseOrderItem);
	}
	
	async needsFix(){
		
		let lastFix = await this.getLastFix();
		
		// Em caso de não ter registro de correção, significa que precisa 
		// de correção.
		if (!lastFix)
			return true;
		
		// Caso não coincida o valor atual com o valor do liquido calculado
		// na ultima correção, então o item vai precisar de correção.
		return (this.getValue() != lastFix.LiquidoCalculado);
	}
	
	async setAsFixed(){
		await POAPI.setItemAsFixed(this.data.PurchaseOrder, this.data.PurchaseOrderItem);
	}
	
	async getLastTrace(){
		let traceData = await TraceAPI.getLastTrace(this.data.PurchaseOrder, this.data.PurchaseOrderItem);
		if (traceData)
			return await Trace.create(traceData);
		return;
	}
	
	async applyFix(trace){
		trace.setGross();
		taxCalculation = trace.recalculateTaxes();
	}
	
	async fix(){
		
		// Em caso de não precisar de correção...
		if (!(await this.needsFix())){
			// Atualizamos o item como corrigido.
			await this.setAsFixed()
			return;
		}
		
		let trace = await this.getLastTrace();
		
		// En caso de não obter nenhum trace.
		if (!trace)
			// Não fazemos nada, já que ainda a API de trace deveria
			// ser atualizada.
			return;

		// Se o valor do payload, não coincide com o valor do item...
		if (trace.getQuantity() != this.data.OrderQuantity ||
			trace.getUnitPrice() != this.data.NetPriceAmount)
			// Não fazemos nada, já que ainda a API de trace deveria
			// ser atualizada.
			return;

		await this.applyFix(trace);
		
	}
}