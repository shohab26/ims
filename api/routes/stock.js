const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const stockController = require('../controller/stockController');


// get request
router.get('/',stockController.findAll);

// get request
router.get('/search',stockController.findByKeyword);
router.get('/trash',stockController.findDeleted);
// get request for single object
router.get('/:id',stockController.findById);
// post request
router.post('/',stockController.save);

// put or patch request
router.patch('/update/:id',stockController.updateById);
// delete request (soft delete)
router.delete('/:id',stockController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('stocks'), stockController.restoreById);



module.exports =router;