const log = require('../../../lib/log');
const Daemon = require('../../../lib/daemon');
const sinon = require('sinon');

beforeEach(() => {
    this.clock = sinon.useFakeTimers();
});
  
afterEach(() => {
    this.clock.restore();
});

describe(`constructor`, () => {

    it("should have the expected status", done => {

        let daemon = new Daemon();

        expect(daemon.sleepMilliseconds).toBe(10*1000);
        expect(daemon.active).toBe(false);
        expect(daemon.running).toBe(false);

        done();

    });

});


describe(`_runOneExecution`, () => {

    it("should log a message", done => {
		log.info = sinon.fake();
		let daemon = new Daemon();
		daemon._runOneExecution();
        expect(log.info.calledOnce).toBe(true);
        expect(log.info.calledWith(`You shoud redefine _runOneExecution method.`)).toBe(true);
        done();
    });

});

describe(`_runOneExecutionAndScheduleNext`, () => {

    it("should run one execution and schedule next if it is active", async done => {

		log.info = sinon.fake();
		let daemon = new Daemon();

        daemon._runOneExecution = sinon.fake.resolves();
        daemon._scheduleNext = sinon.fake();

        daemon.active = true;
        daemon._runOneExecutionAndScheduleNext();

        expect(daemon._runOneExecution.calledOnce).toBe(true);
        expect(daemon._runOneExecution.calledOn(daemon)).toBe(true);

        await this.clock.nextAsync();

        expect(daemon._scheduleNext.calledOnce).toBe(true);
        expect(daemon._scheduleNext.calledOn(daemon)).toBe(true);

        done();
    });

    it("should not run one execution and schedule next if it is not active", async done => {

		log.info = sinon.fake();
		let daemon = new Daemon();

        daemon._runOneExecution = sinon.fake.resolves();
        daemon._scheduleNext = sinon.fake();

        daemon.active = false;
        daemon._runOneExecutionAndScheduleNext();

        expect(daemon._runOneExecution.called).toBe(false);
        expect(daemon._scheduleNext.called).toBe(false);

        done();
    });

    it("while running the state should be running", async done => {

		log.info = sinon.fake();
		let daemon = new Daemon();

        daemon._runOneExecution = sinon.fake.resolves();
        daemon._scheduleNext = sinon.fake();

        daemon.active = true;

        expect(daemon.running).toBe(false);

        daemon._runOneExecutionAndScheduleNext();

        expect(daemon.running).toBe(true);

        await this.clock.nextAsync();

        expect(daemon.running).toBe(false);

        done();

    });

    it("in case of error, should be log and should be scheduled the next run", async done => {

		log.error = sinon.fake();
		let daemon = new Daemon();

        let executionError = new Error()
        daemon._runOneExecution = sinon.fake.rejects(executionError);
        daemon._scheduleNext = sinon.fake();

        daemon.active = true;

        daemon._runOneExecutionAndScheduleNext();

        expect(daemon.running).toBe(true);

        await this.clock.nextAsync();

        expect(log.error.calledOnce).toBe(true);
        expect(log.error.calledWith(executionError)).toBe(true);

        expect(daemon.running).toBe(false);

        expect(daemon._scheduleNext.calledOnce).toBe(true);
        expect(daemon._scheduleNext.calledOn(daemon)).toBe(true);

        done();

    });

});

describe(`_scheduleNext`, () => {

    it("should schedule next if it is not running", async done => {

		let daemon = new Daemon();

        daemon._runOneExecutionAndScheduleNext = sinon.fake();

        daemon.active = true;
        daemon.running = false;
        daemon.sleepMilliseconds = 3000;

        daemon._scheduleNext();

        expect(daemon._runOneExecutionAndScheduleNext.called).toBe(false);

        await this.clock.tickAsync(2999);

        expect(daemon._runOneExecutionAndScheduleNext.called).toBe(false);

        await this.clock.tickAsync(1);

        expect(daemon._runOneExecutionAndScheduleNext.calledOnce).toBe(true);
        expect(daemon._runOneExecutionAndScheduleNext.calledOn(daemon)).toBe(true);

        done();
    });

    it("should not schedule next if it is running", async done => {

		let daemon = new Daemon();

        daemon._runOneExecutionAndScheduleNext = sinon.fake();

        daemon.active = true;
        daemon.running = true;
        daemon.sleepMilliseconds = 3000;

        daemon._scheduleNext();

        await this.clock.tickAsync(3000);

        expect(daemon._runOneExecutionAndScheduleNext.called).toBe(false);

        done();
    });

});

describe(`start`, () => {

    it("should start only if not already active", async done => {

		let daemon = new Daemon();

        daemon._scheduleNext = sinon.fake();

        daemon.active = false;

        daemon.start();

        expect(daemon._scheduleNext.calledOnce).toBe(true);
        expect(daemon._scheduleNext.calledOn(daemon)).toBe(true);

        expect(daemon.active).toBe(true);

        done();

    });

    it("should not start if it is already active", async done => {

		let daemon = new Daemon();

        daemon._scheduleNext = sinon.fake();

        daemon.active = true;

        daemon.start();

        expect(daemon._scheduleNext.called).toBe(false);

        done();

    });

});

describe(`stop`, () => {

    it("should change status to not active", async done => {

		let daemon = new Daemon();

        daemon.active = true;

        daemon.stop();

        expect(daemon.active).toBe(false);

        done();

    });

});

describe(`Start and stop behaviour`, () => {

    it("After start, should be performed the first execution after the sleep time.", async done => {

		let daemon = new Daemon();

        daemon._runOneExecution = sinon.fake.resolves();

        daemon.start();

        await this.clock.tickAsync(9*1000);

        expect(daemon._runOneExecution.called).toBe(false);

        await this.clock.tickAsync(1*1000);

        expect(daemon._runOneExecution.calledOnce).toBe(true);

        done();

    });

    it("The executinons should be repeated between sleep time.", async done => {

		let daemon = new Daemon();

        daemon._runOneExecution = sinon.fake.resolves();

        daemon.start();

        expect(daemon._runOneExecution.callCount).toBe(0);

        await this.clock.tickAsync(10*1000);

        expect(daemon._runOneExecution.callCount).toBe(1);
        expect(daemon._runOneExecution.calledOn(daemon)).toBe(true);

        await this.clock.tickAsync(10*1000);

        expect(daemon._runOneExecution.callCount).toBe(2);
        expect(daemon._runOneExecution.calledOn(daemon)).toBe(true);

        done();

    });

    it("Multiple starts should not modify intervals between executions.", async done => {

		let daemon = new Daemon();

        daemon._runOneExecution = sinon.fake.resolves();

        daemon.start();

        expect(daemon._runOneExecution.callCount).toBe(0);

        await this.clock.tickAsync(2*1000);
        daemon.start();
        expect(daemon._runOneExecution.callCount).toBe(0);

        await this.clock.tickAsync(2*1000);
        daemon.start();
        expect(daemon._runOneExecution.callCount).toBe(0);

        await this.clock.tickAsync(6*1000);

        expect(daemon._runOneExecution.callCount).toBe(1);
        expect(daemon._runOneExecution.calledOn(daemon)).toBe(true);

        await this.clock.tickAsync(3*1000);
        daemon.start();
        expect(daemon._runOneExecution.callCount).toBe(1);

        await this.clock.tickAsync(3*1000);
        daemon.start();
        expect(daemon._runOneExecution.callCount).toBe(1);

        await this.clock.tickAsync(4*1000);

        expect(daemon._runOneExecution.callCount).toBe(2);
        expect(daemon._runOneExecution.calledOn(daemon)).toBe(true);

        done();

    });

    it("Should not execute if stop is called between the sleep interval.", async done => {

		let daemon = new Daemon();

        daemon._runOneExecution = sinon.fake.resolves();

        daemon.start();

        expect(daemon._runOneExecution.called).toBe(false);

        await this.clock.tickAsync(9*1000);

        daemon.stop();

        await this.clock.tickAsync(1*1000);

        expect(daemon._runOneExecution.called).toBe(false);

        done();

    });

    it("Should not execute after sleep interval if start-stop-start sequence is called between the sleep interval.", async done => {

		let daemon = new Daemon();

        daemon._runOneExecution = sinon.fake.resolves();

        daemon.start();

        expect(daemon._runOneExecution.called).toBe(false);

        await this.clock.tickAsync(9*1000);

        daemon.stop();

        await this.clock.tickAsync(500);

        daemon.start();

        await this.clock.tickAsync(500);

        expect(daemon._runOneExecution.called).toBe(false);

        await this.clock.tickAsync(9500);

        expect(daemon._runOneExecution.calledOnce).toBe(true);

        done();

    });

    it("Should be possible to call stop multiple times.", async done => {

		let daemon = new Daemon();

        daemon._runOneExecution = sinon.fake();

        daemon.start();

        expect(daemon._runOneExecution.called).toBe(false);

        await this.clock.tickAsync(9*1000);

        daemon.stop();

        await this.clock.tickAsync(500);

        daemon.stop();

        await this.clock.tickAsync(500);

        expect(daemon._runOneExecution.called).toBe(false);

        done();

    });

    it("Stopping should not stop the current execution.", async done => {

		let daemon = new Daemon();

        daemon._runOneExecution = () =>
            new Promise((resolve, reject) => setTimeout(() => resolve(), 1000));

        daemon.start();

        //expect(daemon._runOneExecution.called).toBe(false);

        await this.clock.tickAsync(10*1000);

        //expect(daemon._runOneExecution.called).toBe(true);
        expect(daemon.running).toBe(true);

        daemon.stop();

        expect(daemon.running).toBe(true);

        await this.clock.tickAsync(500);

        expect(daemon.running).toBe(true);

        await this.clock.tickAsync(500);

        expect(daemon.running).toBe(false);

        daemon.stop();

        done();

    });

    it("The execution duration should not count on sleep duration.", async done => {

		let daemon = new Daemon();

        daemon._runOneExecution = () =>
            new Promise((resolve, reject) => setTimeout(() => resolve(), 1000));

        daemon.start();

        //expect(daemon._runOneExecution.called).toBe(false);

        await this.clock.tickAsync(10*1000);

        //expect(daemon._runOneExecution.called).toBe(true);
        expect(daemon.running).toBe(true);

        await this.clock.tickAsync(999);

        expect(daemon.running).toBe(true);

        await this.clock.tickAsync(1);

        expect(daemon.running).toBe(false);

        await this.clock.tickAsync(9999);

        expect(daemon.running).toBe(false);

        await this.clock.tickAsync(1);

        expect(daemon.running).toBe(true);

        done();

    });

});
