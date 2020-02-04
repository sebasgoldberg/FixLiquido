const Trace = require('../api/trace');

function SAPTimeStampToJSDate(SAPTimeStamp) {
    let groups = SAPTimeStamp.match(/(?<day>[0-9]{2}).(?<month>[0-9]{2}).(?<year>[0-9]{4}) (?<hour>[0-9]{2}):(?<minute>[0-9]{2}):(?<second>[0-9]{2})/).groups;
    return new Date(Date.UTC(
        Number(groups.year),
        Number(groups.month)-1,
        Number(groups.day),
        Number(groups.hour),
        Number(groups.minute),
        Number(groups.second),
    ));
}

module.exports = {
    add: async (oReq, oRes) => {
    
        try{
            [space, GUID, CompanyCode, Application, DocumentCategory, DocumentNumber, 
                FiscalYear, ItemNumber, TimeStamp, ...empty] = 
                    oReq.query.data.split('|')
                        .map( x => x.trim() );
            TimeStamp = SAPTimeStampToJSDate(TimeStamp)
            await Trace.addItem(GUID, CompanyCode, Application, DocumentCategory,
                DocumentNumber, FiscalYear, ItemNumber, TimeStamp);
            response = 'OK'
        }catch(e){
            response = e;
        }
        
        oRes.send(JSON.stringify(response));
    
    }
}