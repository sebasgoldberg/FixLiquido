'use strict';
const request = require('request');
const xsenv = require('@sap/xsenv');
const log = require('../log');
var rp = require('request-promise');

/***
 * Extract client id, client secret and url from the bound Destinations service VCAP_SERVICES object
 *
 * when the promise resolves it returns a clientid, clientsecret and url of the token granting service
 *
 * @returns {Promise<any>}
 */
function getCredentials() {
    return new Promise(function(resolve) {
        const destination = xsenv.getServices({
            destination: {
                tag: 'destination'
            }
        }).destination;

        const credentials = {
            clientid: destination.clientid,
            clientsecret: destination.clientsecret,
            url: destination.url
        };

        resolve(credentials);
    });
}

/***
 * This creates a token for us from the supplied token granting service url, the clientid and the client
 * secret when the promise resolves
 *
 * The return value when the promise resolves is an object and not a string. The request API will turn the response
 * from a string into an object for us.
 *
 * @param destAuthUrl : url of the destination service token granting service - you will still need to append /oath/token to the url
 * @param clientId: the clientId used to get a token from the
 * @param clientSecret : the password to get a token
 * @returns {Promise<any>}
 */
function createToken(destAuthUrl, clientId, clientSecret) {
    return new Promise(function(resolve, reject) {
        // we make a post using x-www-form-urlencoded encoding for the body and for the authorization we use the
        // clientid and clientsecret.
        // Note we specify a grant_type and client_id as required to get the token
        // the request will return a JSON object already parsed
        request({
                url: `${destAuthUrl}/oauth/token`,
                method: 'POST',
                json: true,
                form: {
                    grant_type: 'client_credentials',
                    client_id: clientId
                },
                auth: {
                    user: clientId,
                    pass: clientSecret
                }
            },
            function(error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    resolve(body.access_token);
                }
            });
    });
}

/***
 * This gets the destination using the supplied access token. We generated the access token using
 * createToken above.
 *
 * The destination has the uri field that holds the server(url) that will enable us to get the
 * destination details.
 *
 * -----------------------------------------
 * NOTE WE ASSUME A DESTINATION OF testdest
 * -----------------------------------------
 *
 * As above we do a GET request but instead of authentication we supply a bearer and access token
 * which give us access to the destination service for our service.
 *
 * The return value when the promise resolves is an object and not a string. The request API will turn the response
 * from a string into an object for us.
 *
 * @param access_token : the access token giving us access to the destination service
 * @param destinationName : the name of the destination to retrieve.
 * @returns {Promise<any>}
 */
function getDestination(access_token, destinationName) {
    return new Promise(function(resolve, reject) {
        const destination = xsenv.getServices({ 
            destination: {
                tag: 'destination'
            }
        }).destination;
        // Note that we use the uri and not the url!!!!

        request({
                url: `${destination.uri}/destination-configuration/v1/instanceDestinations/${destinationName}`,
                method: 'GET',
                auth: {
                    bearer: access_token
                },
                json: true
            },
            function(error, response, body) {
                if (error) {
                    log.error(`Error retrieving destination ${error.toString()}`);
                    reject(error);
                } else {
                    resolve(body);
                }
            });
    });
}

// @todo Eliminar destinationServiceName.
function getDestinationFromName(destinationServiceName,destinationName) {
    return new Promise(function (resolve, reject) {
        getCredentials()
            .then(function (credentials) {
                return createToken(credentials.url, credentials.clientid, credentials.clientsecret);
            })
            .then(function (access_token) {
                return getDestination(access_token, destinationName);
            })
            .then(function (destination) {
                resolve(destination);
            })
            .catch(function (error) {
                log.error(`Error getting destination`);
                reject(error);
            });
    });
}

async function createDestination(body, token) {

    const destination = xsenv.getServices({ 
        destination: {
            tag: 'destination'
        }
    }).destination;
    // Note that we use the uri and not the url!!!!

    var options = {
        method: 'POST',
        uri: `${destination.uri}/destination-configuration/v1/instanceDestinations`,
        body: body,
        auth: {
            bearer: token
        },
        json: true
    };

    await rp(options);

    
}

async function deleteDestination(destinationName, token) {

    const destination = xsenv.getServices({ 
        destination: {
            tag: 'destination'
        }
    }).destination;

    var options = {
        method: 'DELETE',
        uri: `${destination.uri}/destination-configuration/v1/instanceDestinations/${destinationName}`,
        auth: {
            bearer: token
        },
        json: true
    };

    await rp(options);
    
}

async function addThis(destinationName) {

    let credentials = await getCredentials();
    let token = await createToken(credentials.url, credentials.clientid, credentials.clientsecret);

    let cfenv = require("cfenv")
    let appEnv = cfenv.getAppEnv()

    try {
        await deleteDestination(destinationName, token);
    } catch (e) {
        console.error(e);
    }

    try {
        await createDestination({
            Name: destinationName,
            Type: "HTTP",
            URL: appEnv.url,
            Authentication: "NoAuthentication",
            ProxyType: "Internet",
            ForwardAuthToken: true,
        }, token);    

    } catch (e) {
        console.error(e);
    }
    
}

module.exports = {
    getDestination: getDestinationFromName,
    addThis: addThis,
};