const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const {
    validateRequired,
    validateCode,
    validateNumericRanges,
    checkUnique,
} = require('../middleware/validation.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const productController = require('../controller/productController');

const validateProduct = [
    validateRequired(['pcode', 'pname', 'price']),
    validateCode('pcode'),
    validateNumericRanges({ price: { min: 0 } }),
    checkUnique({ table: 'products', column: 'pcode', message: 'Product code (SKU) is already in use.' }),
];

// get request
router.get('/', productController.findAll);

// get request
router.get('/search', productController.findByKeyword);
// trash listing (soft-deleted rows)
router.get('/trash', productController.findDeleted);
// get request for single object
router.get('/:id', productController.findById);
// post request
router.post('/', validateProduct, productController.save);

// put or patch request
router.patch('/update/:id', validateProduct, productController.updateById);
// delete request (soft delete)
router.delete('/:id', productController.deleteById);
// restore request (un-soft-delete) — extra permission check because POST
// would otherwise map to can_create via the standard checkPermission map.
router.post('/restore/:id', requireDeletePermission('products'), productController.restoreById);



module.exports =router;