'use strict';
const xsenv = require('@sap/xsenv');
const log = require('../log');
var rp = require('request-promise');

module.exports = class {

    constructor(){

        this.destination = xsenv.getServices({ 
            destination: {
                tag: 'destination'
            }
        }).destination;

    }

    async createToken() {

        let body = await rp({

            url: `${this.destination.url}/oauth/token`,
            method: 'POST',
            json: true,
            form: {
                grant_type: 'client_credentials',
                client_id: this.destination.clientid
            },
            auth: {
                user: this.destination.clientid,
                pass: this.destination.clientsecret
            }
        });

        return body.access_token;
    }

    async getDestination(destinationName) {

        let token = await this.createToken(this.destination.url, this.destination.clientid, this.destination.clientsecret);

        return await rp({
            url: `${this.destination.uri}/destination-configuration/v1/instanceDestinations/${destinationName}`,
            method: 'GET',
            auth: {
                bearer: token
            },
            json: true
        });
    }
     
    async deleteDestination(destinationName) {

        let token = await this.createToken(this.destination.url, this.destination.clientid, this.destination.clientsecret);

        var options = {
            method: 'DELETE',
            uri: `${this.destination.uri}/destination-configuration/v1/instanceDestinations/${destinationName}`,
            auth: {
                bearer: token
            },
            json: true
        };
    
        await rp(options);
        
    }

    async createDestination(body) {

        let token = await this.createToken(this.destination.url, this.destination.clientid, this.destination.clientsecret);

        var options = {
            method: 'POST',
            uri: `${this.destination.uri}/destination-configuration/v1/instanceDestinations`,
            body: body,
            auth: {
                bearer: token
            },
            json: true
        };
    
        await rp(options);
    
        
    }
    
    async addThis(destinationName){

        let cfenv = require("cfenv")
        let appEnv = cfenv.getAppEnv()
    
        try {
            await this.deleteDestination(destinationName);
            log.debug(`Destination ${destinationName} eliminada com sucesso.`);
        } catch (e) {
            log.error(`Erro ao tentar eliminar o destination ${destinationName}: ${JSON.stringify(e)}`);
        }
    
        try {

            await this.createDestination({
                Name: destinationName,
                Type: "HTTP",
                URL: appEnv.url,
                Authentication: "NoAuthentication",
                ProxyType: "Internet",
                ForwardAuthToken: true,
            });    

            log.debug(`Destination ${destinationName} criada com sucesso.`);
    
        } catch (e) {
            log.error(`Erro ao tentar criar o destination ${destinationName}: ${JSON.stringify(e)}`);
        }
    
    }
}