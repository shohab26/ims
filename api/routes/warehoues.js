const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const warehouseController = require('../controller/warehouseController');


// get request
router.get('/search', warehouseController.findByKeyword);
router.get('/', warehouseController.findAll);
router.get('/trash', warehouseController.findDeleted);
// get request for single object
router.get('/:id', warehouseController.findById);
// post request
router.post('/', warehouseController.save);

// put or patch request
router.patch('/update/:id', warehouseController.updateById);
// delete request (soft delete)
router.delete('/:id', warehouseController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('warehouse'), warehouseController.restoreById);



module.exports =router;