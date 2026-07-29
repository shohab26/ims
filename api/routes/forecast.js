const express = require('express');
const router = express.Router();
const forecastController = require('../controller/forecastController');

// numeric forecasts (no AI call)
router.get('/', forecastController.findAll);
// AI explanation — POST because it triggers a billable model call
router.post('/explain', forecastController.explain);
// single product forecast
router.get('/:productId', forecastController.findByProduct);

module.exports = router;
