const log = require('../log');

module.exports = class {

	constructor(){
		this.active = false;
		this.sleepMilliseconds = 10000;
		this.running = false;
	}

	async _runOneExecution(){
		log.info(`You shoud redefine _runOneExecution method.`)
	}

	async _runOneExecutionAndScheduleNext(){
		if (!this.active)
			return;
		this.running = true;
		try {
			await this._runOneExecution();
		} catch (err) {
			log.error(err);
		}
		this.running = false;
		if (!this.active)
			return;
		this._scheduleNext();
	}

	_scheduleNext(){
		if (this.running)
			return;
		this.timeOutObject = setTimeout(this._runOneExecutionAndScheduleNext.bind(this), this.sleepMilliseconds);
	}

	start(){
		if (this.active)
			return;
		this.active = true;
		this._scheduleNext();
	}

	stop(){
		this.active = false;
		if (this.timeOutObject){
			clearTimeout(this.timeOutObject);
			this.timeOutObject = undefined;
		}
	}

	setSleepMilliseconds(sleepMilliseconds){
		this.sleepMilliseconds = sleepMilliseconds;
	}
	
}