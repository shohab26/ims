const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const stockController = require('../controller/stockController');


// get request
router.get('/',stockController.findAll);

// get request
router.get('/search',stockController.findByKeyword);
// get request for single object
router.get('/:id',stockController.findById);
// post request
router.post('/',stockController.save);

// put or patch request
router.patch('/update/:id',stockController.updateById);
// delete request+
router.delete('/:id',stockController.deleteById);



module.exports =router;