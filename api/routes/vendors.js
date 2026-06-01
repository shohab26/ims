const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const vendorController = require('../controller/vendorController');


// get request
router.get('/',vendorController.findAll);

// get request
router.get('/search',vendorController.findByKeyword);
// get request for single object
router.get('/:id',vendorController.findById);
// post request
router.post('/',vendorController.save);

// put or patch request
router.patch('/update/:id',vendorController.updateById);
// delete request+
router.delete('/:id',vendorController.deleteById);



module.exports =router;