const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const { validateRequired, validateNumericRanges } = require('../middleware/validation.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const orderController = require('../controller/orderController');

const validateOrder = [
    validateRequired(['quantity', 'productid', 'unit_price']),
    validateNumericRanges({ quantity: { min: 0 }, unit_price: { min: 0 }, total_price: { min: 0 } }),
];

// get request
router.get('/',orderController.findAll);

// get request
router.get('/search',orderController.findByKeyword);
// get 10 latest
router.get('/latest',orderController.findLatest);
// get request for total
router.get('/total',orderController.findTotalSale);
// trash listing
router.get('/trash',orderController.findDeleted);
// get request for single object
router.get('/:id',orderController.findById);

// post request
router.post('/', validateOrder, orderController.save);

// put or patch request
router.patch('/update/:id', validateOrder, orderController.updateById);
// delete request (soft delete)
router.delete('/:id',orderController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('orders'), orderController.restoreById);



module.exports =router;