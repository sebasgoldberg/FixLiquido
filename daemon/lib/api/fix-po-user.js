var rp = require('request-promise');
const config = require('../config');

let API = class {

	constructor(){
        this.baseUrl = '/sap/opu/odata/sap/YY1_FIX_PO_USERS_CDS/YY1_FIX_PO_USERS/'
	}

	async getCsrfToken(destination = config.destination.s4hc){
		var options = {
		    uri: `${destination.URL}${this.baseUrl}`,
			auth: {
				user: destination.User,
				pass: destination.Password,
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

	async post(body, destination = config.destination.s4hc){

        let csrfTokenData = await this.getCsrfToken(destination);
		
		var options = {
			method: 'POST',
		    uri: `${destination.URL}${this.baseUrl}`,
		    body: body,
			auth: {
				user: destination.User,
				pass: destination.Password,
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