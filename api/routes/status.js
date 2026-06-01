const express = require('express');
const connection = require('../connection');

const router = express.Router();

//controller
const statusController = require('../controller/statusController');


// get request
router.get('/search',statusController.findByKeyword);
router.get('/',statusController.findAll);
// get request for single object
router.get('/:id',statusController.findById);
// post request
router.post('/',statusController.save);

// put or patch request
router.patch('/update/:id',statusController.updateById);
// delete request+
router.delete('/:id',statusController.deleteById);



module.exports =router;