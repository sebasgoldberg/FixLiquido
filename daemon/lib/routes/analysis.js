const POAPI = require('../api/PO');
const Item = require('../model/POItem');
const Trace = require('../model/Trace');
const TaxService = require('../api/tax');
const NetCalculation = require('../model/NetCalculation')
const log = require('../log');



async function calcForGUID(GUID){

    let trace = new Trace({ GUID: GUID });
    let payload = await trace.getPayload();

    let quoteResponseBody = await TaxService.quote(payload.getData());

    result = {};

    result.payloadRequest = payload.getData();
    result.responseBody = quoteResponseBody;

    return result;

}

async function getGrossCalcForGUID(GUID){

    let trace = new Trace({ GUID: GUID });
    let payload = await trace.getPayload();

    let netCalc = new NetCalculation(payload);

    let netUnitPriceCalc = await netCalc.getNetUnitPrice();
    
    result = {};

    result.netUnitPrice = netUnitPriceCalc.netUnitPrice
    result.responseBody = netUnitPriceCalc.quoteResponseBody;
    result.payloadRequest = payload.getData();

    return result;

}

async function getLastState(filter) {

    let pendingItemsData = await POAPI.getPendingItems(filter);
    let pendingItems = pendingItemsData.map( data => new Item(data) );

    let result = [];

    for (let item of pendingItems){

        let itemAnalysis = {};

        try{

            itemAnalysis.data = item.data;

            itemAnalysis.lastFix = await item.getLastFix();
            
            if (itemAnalysis.lastFix.TraceGUID)
                itemAnalysis.trace = await getGrossCalcForGUID(itemAnalysis.lastFix.TraceGUID);

        }catch(e){

            itemAnalysis.error = e;

        }

        result.push(itemAnalysis);
    }

    return result;

}

module.exports = {

    calcForGUID: async (oReq, oRes) => {
    
        let GUID = oReq.query.GUID;

        try{

            if (!GUID)
                throw 'Deve indicar o GUID!!!';

            let result = await calcForGUID(GUID);
            oRes.send(JSON.stringify(result, null, 4));

        }catch(e){

            oRes.status(500).send(`Aconteceu um erro inesperado!: ${e}`);

        }

    },

    grossCalcForGUID: async (oReq, oRes) => {
    
        let GUID = oReq.query.GUID;

        try{

            if (!GUID)
                throw 'Deve indicar o GUID!!!';

            let result = await getGrossCalcForGUID(GUID);
            oRes.send(JSON.stringify(result, null, 4));

        }catch(e){

            oRes.status(500).send(`Aconteceu um erro inesperado!: ${e}`);

        }

    },

    lastState: async (oReq, oRes) => {
    
        try {
            let lastState = await getLastState(oReq.query.filter);
            oRes.send(JSON.stringify(lastState, null, 4));
        } catch (e) {
            log.error(`Erro na request a rota lastState com o filtro = "${oReq.query.filter}"`);
            oRes.status(500).send(`Aconteceu um erro inesperado!: ${e}`);
        }
        
        
        
    
    }
}