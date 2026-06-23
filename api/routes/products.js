const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const productController = require('../controller/productController');


// get request
router.get('/', productController.findAll);

// get request
router.get('/search', productController.findByKeyword);
// trash listing (soft-deleted rows)
router.get('/trash', productController.findDeleted);
// get request for single object
router.get('/:id', productController.findById);
// post request
router.post('/', productController.save);

// put or patch request
router.patch('/update/:id', productController.updateById);
// delete request (soft delete)
router.delete('/:id', productController.deleteById);
// restore request (un-soft-delete) — extra permission check because POST
// would otherwise map to can_create via the standard checkPermission map.
router.post('/restore/:id', requireDeletePermission('products'), productController.restoreById);



module.exports =router;