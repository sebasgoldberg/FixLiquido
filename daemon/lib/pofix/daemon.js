var Daemon = require('../daemon')

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class POFixDaemon extends Daemon{
	
	async _runOneExecution(){
		console.log(`${new Date().toLocaleString()}: POFixDaemon::_runOneExecution::start.`)
		await sleep((2+this.sleepSeconds)*1000);
		console.log(`${new Date().toLocaleString()}: POFixDaemon::_runOneExecution::end.`)
	}

}

module.exports = POFixDaemon;