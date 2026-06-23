const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const categoriesController = require('../controller/categoriesController');


// get request
router.get('/search',categoriesController.findByKeyword);
router.get('/',categoriesController.findAll);
router.get('/trash',categoriesController.findDeleted);
// get request for single object
router.get('/:id',categoriesController.findById);
// post request
router.post('/',categoriesController.save);

// put or patch request
router.patch('/update/:id',categoriesController.updateById);
// delete request (soft delete)
router.delete('/:id',categoriesController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('categories'), categoriesController.restoreById);



module.exports =router;