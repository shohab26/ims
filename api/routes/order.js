const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const orderController = require('../controller/orderController');


// get request
router.get('/',orderController.findAll);

// get request
router.get('/search',orderController.findByKeyword);
// get 10 latest
router.get('/latest',orderController.findLatest);
// get request for total
router.get('/total',orderController.findTotalSale);
// get request for single object
router.get('/:id',orderController.findById);

// post request
router.post('/',orderController.save);

// put or patch request
router.patch('/update/:id',orderController.updateById);
// delete request+
router.delete('/:id',orderController.deleteById);



module.exports =router;