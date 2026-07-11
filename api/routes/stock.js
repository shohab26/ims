const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const { validateRequired, validateNumericRanges } = require('../middleware/validation.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const stockController = require('../controller/stockController');

const validateStock = [
    validateRequired(['quantity', 'productid', 'warehouseid']),
    validateNumericRanges({ quantity: { min: 0 } }),
];

// get request
router.get('/',stockController.findAll);

// get request
router.get('/search',stockController.findByKeyword);
router.get('/trash',stockController.findDeleted);
// get request for single object
router.get('/:id',stockController.findById);
// post request
router.post('/', validateStock, stockController.save);

// put or patch request
router.patch('/update/:id', validateStock, stockController.updateById);
// delete request (soft delete)
router.delete('/:id',stockController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('stocks'), stockController.restoreById);



module.exports =router;