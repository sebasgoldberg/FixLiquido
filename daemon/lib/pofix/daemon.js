var Daemon = require('../daemon');
var POAPI = require('../api/PO');

class POFixDaemon extends Daemon{
	
	constructor(){
		super();
		this.POAPI = new POAPI();
	}
	
	ready(){
		return this.POAPI.ready();
	}
	
	async fixPOs(){
		if (!this.ready())
			throw "Daemon not ready to execute.";
		let pendingPOs = await this.POAPI.getPendingPOs();
		return pendingPOs;
	}
	
	async _runOneExecution(){
		console.log('Inicio');
		try{
			console.log(JSON.stringify(await this.fixPOs()));
		} catch(e){
			console.error(e);
		}
		console.log('Fim');
	}

}

module.exports = POFixDaemon;