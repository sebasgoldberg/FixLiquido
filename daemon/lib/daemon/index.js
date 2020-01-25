module.exports = class {

	constructor(){
		this.active = false;
		this.sleepSeconds = 10;
		this.running = false;
	}

	async _runOneExecution(){
		console.log(`${new Date().toLocaleString()}: You shoud redefine _runOneExecution method.`)
	}

	async _runOneExecutionAndScheduleNext(){
		if (!this.active)
			return;
		this.running = true;
		try {
			await this._runOneExecution();
		} catch (err) {
			console.error(err);
		}
		this.running = false;
		if (!this.active)
			return;
		this._scheduleNext();
	}

	_scheduleNext(){
		if (this.running)
			return;
		setTimeout(this._runOneExecutionAndScheduleNext.bind(this), this.sleepSeconds*1000);
	}

	start(){
		if (this.active)
			return;
		this.active = true;
		this._scheduleNext();
	}
	
	stop(){
		this.active = false;
	}
	
}