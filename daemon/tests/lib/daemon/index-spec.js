const sinon = require('sinon').createSandbox();

beforeEach(() => {
	sinon.useFakeTimers();
});
  
afterEach(() => {
	sinon.restore();
});

const Daemon = require('../../../lib/daemon');
const test = require('../daemon/base.js');

test(Daemon, sinon);

const log = require('../../../lib/log');

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
