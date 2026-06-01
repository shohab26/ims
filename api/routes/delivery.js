const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const deliveryController = require('../controller/deliveryController');


// get request
router.get('/',deliveryController.findAll);

// get request
router.get('/search',deliveryController.findByKeyword);
// get request for latest 10
router.get('/latest',deliveryController.findLatest);
// get request for total
router.get('/total',deliveryController.findTotalSale);
// get request for single object
router.get('/:id',deliveryController.findById);
// post request
router.post('/',deliveryController.save);

// put or patch request
router.patch('/update/:id',deliveryController.updateById);
// delete request+
router.delete('/:id',deliveryController.deleteById);



module.exports =router;