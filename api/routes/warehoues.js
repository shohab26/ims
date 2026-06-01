const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const warehouseController = require('../controller/warehouseController');


// get request
router.get('/search',warehouseController.findByKeyword);
router.get('/',warehouseController.findAll);
// get request for single object
router.get('/:id',warehouseController.findById);
// post request
router.post('/',warehouseController.save);

// put or patch request
router.patch('/update/:id',warehouseController.updateById);
// delete request+
router.delete('/:id',warehouseController.deleteById);



module.exports =router;