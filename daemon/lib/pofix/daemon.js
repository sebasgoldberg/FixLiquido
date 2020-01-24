var Daemon = require('../daemon')

class POFixDaemon extends Daemon{

	_runOneExecution(){
		console.log(`${new Date().toLocaleString()}: POFixDaemon::_runOneExecution.`)
	}

}

module.exports = POFixDaemon;