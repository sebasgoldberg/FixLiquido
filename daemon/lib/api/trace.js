var rp = require('request-promise');
const config = require('../config');

let API = class {

	async getCsrfToken(){
		var options = {
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_TAXSERVICETRACE_CDS/YY1_TAXSERVICETRACE`,
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
			headers: {
				'X-CSRF-Token': 'Fetch'
			},
		    resolveWithFullResponse: true
		};

		let response = await rp(options);
		
		return {
			csrfToken: response.headers['x-csrf-token'],
			setCookie: response.headers['set-cookie'].join('; '),
		};
	}

	_dateToODataQueryString(date){
		let groups = JSON.stringify(date).match(/"(?<date>.*)"/).groups;
		return `datetimeoffset'${groups.date}'`;
	}

	async getLastTrace(DocumentNumber, ItemNumber, fromDateTime){

		let fromDateFilter = fromDateTime ? ` and SAP_CreatedDateTime ge ${this._dateToODataQueryString(fromDateTime)}` : '';

		var options = {
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_TAXSERVICETRACE_CDS/YY1_TAXSERVICETRACE`,
		    qs: {
		    	'$format': 'json',
				'$select': 'GUID',
		    	'$filter': `DocumentNumber eq '${DocumentNumber}' and ItemNumber eq '${ItemNumber}'${fromDateFilter}`,
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

	async addItem(GUID, CompanyCode, Application, DocumentCategory, DocumentNumber, FiscalYear, ItemNumber, TimeStamp){

		let csrfTokenData = await this.getCsrfToken()
		
		var options = {
			method: 'POST',
		    uri: `${config.destination.s4hc.URL}/sap/opu/odata/sap/YY1_TAXSERVICETRACE_CDS/YY1_TAXSERVICETRACE`,
		    body: {
				GUID: GUID,
				CompanyCode: CompanyCode,
				Application: Application,
				DocumentCategory: DocumentCategory,
				DocumentNumber: DocumentNumber,
				FiscalYear: FiscalYear,
				ItemNumber: ItemNumber,
				TimeStamp: TimeStamp
		    },
			auth: {
				user: config.destination.s4hc.User,
				pass: config.destination.s4hc.Password,
			},
		    json: true,
		    headers: {
		    	'x-csrf-token': csrfTokenData.csrfToken,
		    	'Cookie': csrfTokenData.setCookie,
		    }
		};

		await rp(options);
	}
}

module.exports = new API();