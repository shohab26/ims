const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const statusController = require('../controller/statusController');


// get request
router.get('/search',statusController.findByKeyword);
router.get('/',statusController.findAll);
router.get('/trash',statusController.findDeleted);
// get request for single object
router.get('/:id',statusController.findById);
// post request
router.post('/',statusController.save);

// put or patch request
router.patch('/update/:id',statusController.updateById);
// delete request (soft delete)
router.delete('/:id',statusController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('status'), statusController.restoreById);



module.exports =router;