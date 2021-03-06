const router = require('express').Router();
let POFixDaemonInstance = require('../pofix/instance');
const log = require('../log');

router.get('/exec/start', function(oReq, oRes) {
	
	POFixDaemonInstance.start();

	oRes.send('Ativado');

});

router.get('/exec/stop', function(oReq, oRes) {
	
	// active = false;

	POFixDaemonInstance.stop();

	oRes.send('Desativado');

});

const config = require('../config');

router.get('/config/set/reload', function(oReq, oRes) {
	
	config.reload();

	oRes.send('Reloaded');

});

function getConfig() {

	let result = {
		loggingLevel: log.getLoggingLevel(),
		sleepMilliseconds: POFixDaemonInstance.sleepMilliseconds,
	};

	Object.assign(result, config.params)

	return result;
}

router.get('/config/set/params', function(oReq, oRes) {

	try {
		if (oReq.query.sleepMilliseconds)
			POFixDaemonInstance.setSleepMilliseconds(Number(oReq.query.sleepMilliseconds));

		if (oReq.query.itemsAdditionalFilters)
			config.params.itemsAdditionalFilters = oReq.query.itemsAdditionalFilters;

		if (oReq.query.POAdditionalFilters)
			config.params.POAdditionalFilters = oReq.query.POAdditionalFilters;

		if (oReq.query.loggingLevel)
			log.setLoggingLevel(oReq.query.loggingLevel);

		oRes.send(JSON.stringify(getConfig()));

	} catch (error) {
		oRes.send(error);
	}


});

router.get('/config/get/params', function(oReq, oRes) {
	
	oRes.send(JSON.stringify(getConfig()));

});

const trace = require('../routes/trace')

router.get('/trace/add', trace.add );

const analysis = require('../routes/analysis')

router.get('/analysis/last/state', analysis.lastState );

router.get('/analysis/gross/calc/for/guid', analysis.grossCalcForGUID );

router.get('/analysis/quote/for/guid', analysis.calcForGUID );

const metrics = require('../routes/metrics')

router.get('/metrics/', metrics.get );

module.exports = router;