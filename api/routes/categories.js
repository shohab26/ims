const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const categoriesController = require('../controller/categoriesController');


// get request
router.get('/search',categoriesController.findByKeyword);
router.get('/',categoriesController.findAll);
// get request for single object
router.get('/:id',categoriesController.findById);
// post request
router.post('/',categoriesController.save);

// put or patch request
router.patch('/update/:id',categoriesController.updateById);
// delete request+
router.delete('/:id',categoriesController.deleteById);



module.exports =router;