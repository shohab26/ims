const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const productController = require('../controller/productController');


// get request
router.get('/',productController.findAll);

// get request
router.get('/search',productController.findByKeyword);
// get request for single object
router.get('/:id',productController.findById);
// post request
router.post('/',productController.save);

// put or patch request
router.patch('/update/:id',productController.updateById);
// delete request+
router.delete('/:id',productController.deleteById);



module.exports =router;