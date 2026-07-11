const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const { validateRequired, validateEmail } = require('../middleware/validation.middleware');
const connection = require('../connection');

const router = express.Router();

//controller
const customerController = require('../controller/customersController');

const validateCustomer = [
    validateRequired(['customer_name', 'email']),
    validateEmail('email'),
];

// get request
router.get('/',customerController.findAll);

// get request
router.get('/search',customerController.findByKeyword);
router.get('/trash',customerController.findDeleted);
// get request for single object
router.get('/:id',customerController.findById);
// post request
router.post('/', validateCustomer, customerController.save);

// put or patch request
router.patch('/update/:id', validateCustomer, customerController.updateById);
// delete request (soft delete)
router.delete('/:id',customerController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('customers'), customerController.restoreById);



module.exports =router;