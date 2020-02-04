const sinon = require('sinon').createSandbox();
    
beforeEach(() => {
	sinon.useFakeTimers();
});
  
afterEach(() => {
	sinon.restore();
});

const trace = require('../../../lib/routes/trace');
const Trace = require('../../../lib/api/trace');

describe(`add`, () => {
    
    it("should parse the data and add the new trace item.", async done => {

        Trace.addItem = sinon.fake.resolves();

        let oReq = {
            query:{
                data: '|FA163EC5B6871ED9BF81DAB49FADE7EC|1410  |TX       |F       |4500000061|      2019|    10 |31.10.2019 18:47:07|        |        |          |'
            }
        };
        let oRes = {
            send: sinon.fake()
        }

        trace.add(oReq, oRes);

        expect(Trace.addItem.calledOnce).toBe(true);
        expect(Trace.addItem.getCall(0).args).
            toEqual(["FA163EC5B6871ED9BF81DAB49FADE7EC", "1410", "TX", "F", "4500000061", "2019", "10", 
                new Date(Date.UTC(2019, 10-1, 31, 18, 47, 7))]);

        expect(oRes.send.called).toBe(false);

        await sinon.clock.nextAsync();

        expect(oRes.send.calledOnce).toBe(true);
        expect(oRes.send.getCall(0).args[0]).toBe(JSON.stringify('OK'));

        done();
    });

});

