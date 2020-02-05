const Daemon = require('../../../lib/pofix/daemon');
const log = require('../../../lib/log');
const config = require('../../../lib/config');
const POAPI = require('../../../lib/api/PO');
const PO = require('../../../lib/model/PO');

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

describe(`workflowApplies`, () => {
    
    it("should apply in case there are alternative purchasing groups defined.", done => {
        config.params.alternativePurchasingGroups = { 101: '100' };
		let daemon = new Daemon();
        expect(daemon.workflowApplies()).toBe(true);
        done();
    });

    it("should not apply in case there are alternative purchasing groups defined.", done => {
        config.params.alternativePurchasingGroups = { };
		let daemon = new Daemon();
        expect(daemon.workflowApplies()).toBe(false);
        done();
    });

});

describe(`getFilterAlternativePurchasingGroups`, () => {
    
    it("should obtain the expected filter for one alternative purchasing groups.", done => {
        config.params.alternativePurchasingGroups = { 101: '100' };
		let daemon = new Daemon();
        expect(daemon.getFilterAlternativePurchasingGroups()).toBe(`( PurchasingGroup eq '101' )`);
        done();
    });

    it("should obtain the expected filter for multiple alternatives purchasing groups.", done => {
        config.params.alternativePurchasingGroups = { 101: '001', 102: '002', 103: '003' };
		let daemon = new Daemon();
        expect(daemon.getFilterAlternativePurchasingGroups()).toBe(
            `( PurchasingGroup eq '101' or PurchasingGroup eq '102' or PurchasingGroup eq '103' )`
            );
        done();
    });

});


describe(`getPendingWorkflowPOs`, () => {
    
    it("should call the PO api with the expected options.", async done => {
        let daemon = new Daemon();

        daemon.getFilterAlternativePurchasingGroups = sinon.fake.returns(`( PurchasingGroup eq '101' )`);
        POAPI.getPOs = sinon.fake.returns([]);

        daemon.getPendingWorkflowPOs();

        await sinon.clock.nextAsync();

        expect(POAPI.getPOs.calledOnce).toBe(true);
        expect(POAPI.getPOs.getCall(0).args[0]).toEqual({
			'$select': 'PurchaseOrder,PurchasingGroup,to_PurchaseOrderItem/YY1_PrecoLiqCorrigido_PDI',
			'$expand': 'to_PurchaseOrderItem',
			'$filter': `( PurchasingGroup eq '101' )`,
        });
        done();
    });

    it("should return the POs that have all its items already fixed.", async done => {
        let daemon = new Daemon();

        daemon.getFilterAlternativePurchasingGroups = sinon.fake.returns(`( PurchasingGroup eq '101' )`);

        POAPI.getPOs = sinon.fake();

        let pos = [];
        pos.push(new PO({}));
        pos.push(new PO({}));
        pos.push(new PO({}));

        pos[0].hasAllItemsFixed = sinon.fake.returns(true);
        pos[1].hasAllItemsFixed = sinon.fake.returns(false);
        pos[2].hasAllItemsFixed = sinon.fake.returns(true);

        daemon.getPOsFromPOsData = sinon.fake.returns(pos);

        let pendingWorkflowPOs = await daemon.getPendingWorkflowPOs();

        expect(pos[0].hasAllItemsFixed.calledOnce).toBe(true);
        expect(pos[0].hasAllItemsFixed.calledOn(pos[0])).toBe(true);
        expect(pos[1].hasAllItemsFixed.calledOnce).toBe(true);
        expect(pos[1].hasAllItemsFixed.calledOn(pos[1])).toBe(true);
        expect(pos[2].hasAllItemsFixed.calledOnce).toBe(true);
        expect(pos[2].hasAllItemsFixed.calledOn(pos[2])).toBe(true);
        
        expect(pendingWorkflowPOs).toEqual([pos[0], pos[2]])

        done();
    });

});

describe(`gerarWorkflowPOs`, () => {
    
    it("should set the original purchasing group for each pending workflow PO.", async done => {

        let daemon = new Daemon();

        daemon.active = true;

        daemon.workflowApplies = sinon.fake.returns(true);

        let pos = [];
        pos.push(new PO({}));
        pos.push(new PO({}));

        pos[0].setOriginalPurchasingGroup = sinon.fake.resolves();
        pos[1].setOriginalPurchasingGroup = sinon.fake.resolves();

        daemon.getPendingWorkflowPOs = sinon.fake.resolves(pos);

        await daemon.gerarWorkflowPOs();
        
        expect(pos[0].setOriginalPurchasingGroup.calledOnce).toBe(true);
        expect(pos[0].setOriginalPurchasingGroup.calledOn(pos[0])).toBe(true);
        expect(pos[1].setOriginalPurchasingGroup.calledOnce).toBe(true);
        expect(pos[1].setOriginalPurchasingGroup.calledOn(pos[1])).toBe(true);
        
        done();
    });

    it("should handle each exception in isolated way.", async done => {

        let daemon = new Daemon();

        daemon.active = true;

        daemon.workflowApplies = sinon.fake.returns(true);

        log.error = sinon.fake();

        let errors = []
        errors.push(new Error('E0'));
        errors.push(new Error('E1'));

        let pos = [];
        pos.push(new PO({ PurchaseOrder: 'P0' }));
        pos.push(new PO({ PurchaseOrder: 'P1' }));

        pos[0].setOriginalPurchasingGroup = sinon.fake.rejects(errors[0]);
        pos[1].setOriginalPurchasingGroup = sinon.fake.rejects(errors[0]);

        daemon.getPendingWorkflowPOs = sinon.fake.resolves(pos);

        await daemon.gerarWorkflowPOs();
        
        expect(log.error.calledTwice).toBe(true);
        expect(log.error.getCall(0).args[0]).toEqual(
            `Erro ao tentar modificar o grupo de compradores do PO P0: ${errors[0].toString()}`);
        expect(log.error.getCall(1).args[0]).toEqual(
            `Erro ao tentar modificar o grupo de compradores do PO P1: ${errors[0].toString()}`);
        
        done();
    });

});
