const POAPI = require('../api/PO');

module.exports = {
    get: async (oReq, oRes) => {
        try{
            let corrigidosPromise = POAPI.countItems({
                '$filter': 'YY1_PrecoLiqCorrigido_PDI eq true'
                });
    
            let totalPromise = POAPI.countItems();
    
            [corrigidos, total] = await Promise.all([
                corrigidosPromise, totalPromise
                ]);
    
            oRes.send(JSON.stringify({
                corrigidos: corrigidos,
                total: total,
            }));
        }catch(e){
            oRes.status(500).send(`Aconteceu um erro inesperado!: ${e}`);
        }
    
    }
}