const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const customerController = require('../controller/customersController');


// get request
router.get('/',customerController.findAll);

// get request
router.get('/search',customerController.findByKeyword);
router.get('/trash',customerController.findDeleted);
// get request for single object
router.get('/:id',customerController.findById);
// post request
router.post('/',customerController.save);

// put or patch request
router.patch('/update/:id',customerController.updateById);
// delete request (soft delete)
router.delete('/:id',customerController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('customers'), customerController.restoreById);



module.exports =router;