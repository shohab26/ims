const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const { validateRequired, validateNumericRanges } = require('../middleware/validation.middleware');

const router = express.Router();

//controller
const returnController = require('../controller/returnController');

const validateReturn = [
    validateRequired(['delivery_id', 'qty']),
    validateNumericRanges({ qty: { min: 0.01 } }),
];

// get request
router.get('/', returnController.findAll);

// get request
router.get('/search', returnController.findByKeyword);
// trash listing
router.get('/trash', returnController.findDeleted);
// get request for single object
router.get('/:id', returnController.findById);

// post request
router.post('/', validateReturn, returnController.save);

// put or patch request
router.patch('/update/:id', returnController.updateById);
// status transition (state machine)
router.patch('/:id/status', returnController.transitionStatus);
// delete request (soft delete)
router.delete('/:id', returnController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('returns'), returnController.restoreById);

module.exports = router;
