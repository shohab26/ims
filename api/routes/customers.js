const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const customerController = require('../controller/customersController');


// get request
router.get('/',customerController.findAll);

// get request
router.get('/search',customerController.findByKeyword);
// get request for single object
router.get('/:id',customerController.findById);
// post request
router.post('/',customerController.save);

// put or patch request
router.patch('/update/:id',customerController.updateById);
// delete request+
router.delete('/:id',customerController.deleteById);



module.exports =router;