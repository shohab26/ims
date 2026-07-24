const express = require('express');
const router = express.Router();
const ctrl = require('../controller/reportController');

router.get('/sales', ctrl.salesReport);
router.get('/purchases', ctrl.purchaseReport);
router.get('/stock-valuation', ctrl.stockValuationReport);
router.get('/profit-loss', ctrl.profitLossReport);
router.get('/top-selling', ctrl.topSellingReport);
router.get('/dead-stock', ctrl.deadStockReport);
router.get('/export', ctrl.exportReport);

module.exports = router;
