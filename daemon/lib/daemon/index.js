module.exports = class {

	constructor(){
		this.active = false;
		this.sleepSeconds = 10;
	}

	_runOneExecution(){
		console.log(`${new Date().toLocaleString()}: You shoud redefine _runOneExecution method.`)
	}

	_runOneExecutionAndScheduleNext(){
		if (!this.active)
			return;
		this._runOneExecution();
		this._scheduleNext();
	}

	_scheduleNext(){
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