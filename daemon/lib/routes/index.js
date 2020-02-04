const router = require('express').Router();
let POFixDaemonInstance = require('../pofix/instance');
const log = require('../log');

router.get('/start', function(oReq, oRes) {
	
	POFixDaemonInstance.start();

	oRes.send('Ativado');

});

router.get('/stop', function(oReq, oRes) {
	
	// active = false;

	POFixDaemonInstance.stop();

	oRes.send('Desativado');

});

const config = require('../config');

router.get('/config/reload', function(oReq, oRes) {
	
	config.reload();

	oRes.send('Reloaded');

});

router.get('/params/set', function(oReq, oRes) {
	
	if (oReq.query.sleepMilliseconds)
		POFixDaemonInstance.setSleepMilliseconds(Number(oReq.query.sleepMilliseconds));

    if (oReq.query.itemsByExecution)
		config.params.itemsByExecution = Number(oReq.query.itemsByExecution);

    if (oReq.query.itemsAdditionalFilters)
		config.params.itemsAdditionalFilters = oReq.query.itemsAdditionalFilters;

	if (oReq.query.loggingLevel)
		log.setLoggingLevel(oReq.query.loggingLevel);

	oRes.send('Modified');

});

router.get('/params/get', function(oReq, oRes) {
	
	oRes.send(JSON.stringify({
		sleepMilliseconds: POFixDaemonInstance.sleepMilliseconds,
        itemsByExecution: config.params.itemsByExecution,
        itemsAdditionalFilters: config.params.itemsAdditionalFilters,
		loggingLevel: log.getLoggingLevel(),
	}));

});

const trace = require('../routes/trace')

router.get('/trace/add', trace.add );

const analysis = require('../routes/analysis')

router.get('/analysis/last/state', analysis.lastState );

module.exports = router;