const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const vendorController = require('../controller/vendorController');


// get request
router.get('/',vendorController.findAll);

// get request
router.get('/search',vendorController.findByKeyword);
router.get('/trash',vendorController.findDeleted);
// get request for single object
router.get('/:id',vendorController.findById);
// post request
router.post('/',vendorController.save);

// put or patch request
router.patch('/update/:id',vendorController.updateById);
// delete request (soft delete)
router.delete('/:id',vendorController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('vendors'), vendorController.restoreById);



module.exports =router;