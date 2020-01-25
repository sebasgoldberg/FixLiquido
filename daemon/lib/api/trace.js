var rp = require('request-promise');
const config = require('../config');

let API = class {

	async getLastTrace(DocumentNumber, ItemNumber){
		var options = {
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_TAXSERVICETRACE_CDS/YY1_TAXSERVICETRACE`,
		    qs: {
		    	'$format': 'json',
		    	'$select': 'GUID',
		    	'$filter': `DocumentNumber eq '${DocumentNumber}' and ItemNumber eq '${ItemNumber}'`,
		    	'$orderby': 'TimeStamp desc',
		    	'$top': '1',
		    },
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
		    json: true // Automatically parses the JSON string in the response
		};

		let body = await rp(options);
		
		return body.d.results.pop();
	}
}

module.exports = new API();