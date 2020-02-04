const POAPI = require('../api/PO');
const Item = require('../model/POItem');
const Trace = require('../model/Trace');
const TaxService = require('../api/tax');

module.exports = {

    lastState: async (oReq, oRes) => {
    
        let filter = oReq.query.filter;

		let pendingItemsData = await POAPI.getPendingItems(100, filter);
		let pendingItems = pendingItemsData.map( data => new Item(data) );

        let result = [];

        for (let item of pendingItems){

            let itemAnalysis = {};

            try{

                itemAnalysis.data = item.data;
                itemAnalysis.lastFix = await item.getLastFix();
                
                let trace = new Trace({ GUID: itemAnalysis.lastFix.TraceGUID });
                let payload = await trace.getPayload();
                payload.setGross();

                itemAnalysis.trace = { payloadRequest: payload.getData() };

                itemAnalysis.trace.responseBody = await TaxService.quote(itemAnalysis.trace.payloadRequest);

            }catch(e){

                itemAnalysis.error = e;

            }

            result.push(itemAnalysis);
        }
        
        oRes.send(JSON.stringify(result));
    
    }
}