const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const { validateRequired, validateNumericRanges } = require('../middleware/validation.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const deliveryController = require('../controller/deliveryController');

const validateDelivery = [
    validateRequired(['quantity', 'productid', 'unit_price', 'warehouseid']),
    validateNumericRanges({ quantity: { min: 0 }, unit_price: { min: 0 }, total_price: { min: 0 } }),
];

// get request
router.get('/',deliveryController.findAll);

// get request
router.get('/search',deliveryController.findByKeyword);
// get request for latest 10
router.get('/latest',deliveryController.findLatest);
// get request for total
router.get('/total',deliveryController.findTotalSale);
// trash listing
router.get('/trash',deliveryController.findDeleted);
// get request for single object
router.get('/:id',deliveryController.findById);
// post request
router.post('/', validateDelivery, deliveryController.save);

// put or patch request
router.patch('/update/:id', validateDelivery, deliveryController.updateById);
// status transition (state machine)
router.patch('/:id/status', deliveryController.transitionStatus);
// delete request (soft delete)
router.delete('/:id',deliveryController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('delivery'), deliveryController.restoreById);



module.exports =router;