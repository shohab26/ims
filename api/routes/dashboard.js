const express = require('express');
const router = express.Router();
const ctrl = require('../controller/dashboardController');

router.get('/revenue-chart', ctrl.revenueChart);
router.get('/inventory-value', ctrl.inventoryValue);
router.get('/pending-orders', ctrl.pendingOrdersCount);
router.get('/overdue-invoices', ctrl.overdueInvoices);
router.get('/top-customers', ctrl.topCustomers);
router.get('/top-products', ctrl.topProducts);

module.exports = router;
