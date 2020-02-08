var rp = require('request-promise');
const config = require('../config');

let API = class {

	async get(options, destination = config.destination.s4hc){
        options['$format'] = 'json';
		var options = {
		    uri: `${destination.URL}/sap/opu/odata/sap/YY1_GRUPO_COMP_USO_INTERNO_CDS/YY1_GRUPO_COMP_USO_INTERNO/`,
		    qs: options,
			auth: {
				user: destination.User,
				pass: destination.Password,
			},
		    json: true
		};

		let body = await rp(options);
		
		return body.d.results;
	}

}

module.exports = new API();