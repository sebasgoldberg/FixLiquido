const config = require('../config');
const POAPI = require('../api/PO');
const log = require('../log');

module.exports = class{

	constructor(data){
        /* 
        data example: 
            {
                "__metadata": {
                    "id": "https://my303734.s4hana.ondemand.com:443/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder('4500000197')",
                    "uri": "https://my303734.s4hana.ondemand.com:443/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder('4500000197')",
                    "type": "API_PURCHASEORDER_PROCESS_SRV.A_PurchaseOrderType"
                },
                "PurchaseOrder": "4500000197",
                "PurchasingGroup": "001",
                "to_PurchaseOrderItem": {
                    "results": [
                        {
                            "__metadata": {
                                "id": "https://my303734.s4hana.ondemand.com:443/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem(PurchaseOrder='4500000197',PurchaseOrderItem='20')",
                                "uri": "https://my303734.s4hana.ondemand.com:443/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem(PurchaseOrder='4500000197',PurchaseOrderItem='20')",
                                "type": "API_PURCHASEORDER_PROCESS_SRV.A_PurchaseOrderItemType"
                            },
                            "YY1_PrecoLiqCorrigido_PDI": false
                        },
                        {
                            "__metadata": {
                                "id": "https://my303734.s4hana.ondemand.com:443/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem(PurchaseOrder='4500000197',PurchaseOrderItem='10')",
                                "uri": "https://my303734.s4hana.ondemand.com:443/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrderItem(PurchaseOrder='4500000197',PurchaseOrderItem='10')",
                                "type": "API_PURCHASEORDER_PROCESS_SRV.A_PurchaseOrderItemType"
                            },
                            "YY1_PrecoLiqCorrigido_PDI": false
                        }
                    ]
                }
            }
        */
		this.data = data;
	}
    
    hasAllItemsFixed(){

        if (this.data.to_PurchaseOrderItem.results.length == 0)
            return false;

        for (let itemData of this.data.to_PurchaseOrderItem.results){
            if (!itemData.YY1_PrecoLiqCorrigido_PDI)
                return false;
        }

        return true;

    }

    getOriginalPurchaseGroup(){
        return config.params.alternativePurchasingGroups[this.data.PurchasingGroup];
    }

	async setOriginalPurchasingGroup(){
        let originalPurchaseGroup = this.getOriginalPurchaseGroup();
        await POAPI.patchPO(this.data.PurchaseOrder,{
            "PurchasingGroup": originalPurchaseGroup
        });
        log.info(`Modificado com sucesso grupo de compradores de ${this.data.PurchasingGroup} `+
            `para ${originalPurchaseGroup} no PO ${this.data.PurchaseOrder}.`);
	}
	
}