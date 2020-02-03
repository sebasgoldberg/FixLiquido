const Daemon = require('../../../lib/pofix/daemon');
const log = require('../../../lib/log');

const sinon = require('sinon').createSandbox();
    
beforeEach(() => {
	sinon.useFakeTimers();
});
  
afterEach(() => {
	sinon.restore();
});

const test = require('../daemon/base.js');

test(Daemon, sinon);

describe(`_runOneExecution`, () => {
    
    it("should execute the fix PO process.", done => {
		let daemon = new Daemon();
		daemon.fixPOs = sinon.fake();
        daemon._runOneExecution();
        expect(daemon.fixPOs.calledOnce).toBe(true);
        expect(daemon.fixPOs.calledOn(daemon)).toBe(true);
        done();
    });

    it("should not finish until the fix PO process finish.", async done => {

		log.info = sinon.fake();

		let daemon = new Daemon();

		daemon.fixPOs =  sinon.fake(() =>
			new Promise((resolve, reject) => setTimeout(() => resolve(), 1000)));

		daemon._runOneExecution();

		expect(daemon.fixPOs.calledOnce).toBe(true);
		expect(daemon.fixPOs.calledOn(daemon)).toBe(true);

        expect(log.info.calledOnce).toBe(true);
        expect(log.info.calledWith('Execução iniciada.')).toBe(true);

		await sinon.clock.tickAsync(500);

        expect(log.info.calledOnce).toBe(true);
        expect(log.info.calledWith('Execução finalizada.')).toBe(false);

		await sinon.clock.tickAsync(500);

        expect(log.info.calledTwice).toBe(true);
        expect(log.info.calledWith('Execução finalizada.')).toBe(true);

        done();
    });

});
