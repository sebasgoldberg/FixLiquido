/*eslint no-console: 0*/
"use strict";

var http = require("http");
var port = process.env.PORT || 3000;
var destination = require("./destination");
const destinationService = "dest_FixLiquido";

http.createServer( function (req, res) {
  
	Promise.all([
		destination.getDestination(destinationService, "s4hc"), 
		destination.getDestination(destinationService, "taxService")]
		)
		.then( destinations => {
  			res.writeHead(200, {"Content-Type": "text/plain"});
			res.end(JSON.stringify(destinations));
		});
	
  /*
  res.end("Hello World\n"+JSON.stringify({
            clientid: destination.clientid,
            clientsecret: destination.clientsecret,
            url: destination.url
        }));
  */
}).listen(port);

console.log("Server listening on port %d", port);
