var rp = require('request-promise');
const config = require('../config');
const log = require('../log');

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
		    resolveWithFullResponse: true
		};

		let response = await rp(options);
		let body = response.body;
		
		this.bearerToken = body.access_token;
		this.setCookies = response.headers['set-cookie'].join('; ');
		
		this.tokenExpiresDate = new Date();
		this.tokenExpiresDate.setMilliseconds(
			this.tokenExpiresDate.getMilliseconds()+body.expires_in
			);
	}

	async getBearerToken(){

		// @todo Eliminar.		
		return config.destination.taxService.Password;
		
		// Em caso que o token não esteja definido ou tenha expirado...
		if (!this.bearerToken || this.tokenExpiresDate < (new Date())){

			try{
				await this.fetchBearerToken();
			}catch(e){
				log.error("Erro ao tentar obter Bearer token do serviço de impostos.");
				throw e;
			}

		}
		
		return {
			bearerToken: this.bearerToken,
			setCookies: this.setCookies
		};
			
	}

	async getLogFromGUID(GUID){

		let tokenData = await this.getBearerToken();

		var options = {
		    uri: `${config.destination.taxService.URL}/TaxService/tenantAccessLogs`,
		    qs: {
		    	'documentId': GUID,
		    },
			auth: {
				//bearer: tokenData.bearerToken
				bearer: tokenData
			},
		    /*headers: {
		    	'Cookie': tokenData.setCookies,
		    },*/
		    json: true
		};

		let body = await rp(options);
		
		return body.tenantAccessLogs.pop();

	}

	async quote(payload){

		let tokenData = await this.getBearerToken();

		var options = {
		    method: 'POST',
		    uri: `${config.destination.taxService.URL}/TaxService/TaxService/quote`,
			auth: {
				//bearer: tokenData.bearerToken
				bearer: tokenData
			},
		    /*headers: {
		    	'Cookie': tokenData.setCookies,
		    },*/
			body: payload,
		    json: true
		};

		let body = await rp(options);
		
		return body;

	}

}

module.exports = new API();