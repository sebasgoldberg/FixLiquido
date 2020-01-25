var rp = require('request-promise');
const config = require('../config');

let API = class {
	
	async fetchBearerToken(){

		var options = {
			method: 'POST',
		    uri: `${config.destination.taxService.tokenServiceURL}`,
			auth: {
				user: config.destination.taxService.clientId,
				pass: config.destination.taxService.clientSecret,
			},
		    json: true,
		    headers: {
		    	'x-csrf-token': await this.getCsrfToken()
		    }
		};

		let body = await rp(options);
		
		this.bearerToken = body.access_token;
		
		this.tokenExpiresDate = new Date();
		this.tokenExpiresDate.setMiliseconds(
			this.tokenExpiresDate.getMiliseconds()+body.expires_in
			);
	}

	async getBearerToken(){
		
		// Em caso que o token não esteja definido ou tenha expirado...
		if (!this.bearerToken || this.tokenExpiresDate < (new Date()))
			await this.fetchBearerToken();
		
		return this.bearerToken;
			
	}

	async getLogFromGUID(GUID){

		var options = {
		    uri: `${config.destination.taxService.URL}/TaxService/tenantAccessLogs`,
		    qs: {
		    	'documentId': GUID,
		    },
			auth: {
				bearer: await this.getBearerToken()
			},
		    json: true
		};

		let body = await rp(options);
		
		return body.tenantAccessLogs.pop();

	}

	async quote(payload){

		var options = {
		    method: 'POST',
		    uri: `${config.destination.taxService.URL}/TaxService/TaxService/quote`,
			auth: {
				bearer: await this.getBearerToken()
			},
			body: payload,
		    json: true
		};

		let body = await rp(options);
		
		return body;

	}

}

module.exports = new API();