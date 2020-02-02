const log = require('../../../lib/log');
const Daemon = require('../../../lib/daemon');
const sinon = require('sinon');

beforeEach(() => {
    this.clock = sinon.useFakeTimers();
});
  
afterEach(() => {
    this.clock.restore();
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

});
