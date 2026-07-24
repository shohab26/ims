const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const { validateRequired, validateNumericRanges } = require('../middleware/validation.middleware');

const router = express.Router();

//controller
const stockTransferController = require('../controller/stockTransferController');

const validateTransfer = [
    validateRequired(['from_warehouse', 'to_warehouse', 'productid', 'qty']),
    validateNumericRanges({ qty: { min: 0.01 } }),
];

// get request
router.get('/', stockTransferController.findAll);

// get request
router.get('/search', stockTransferController.findByKeyword);
// trash listing
router.get('/trash', stockTransferController.findDeleted);
// get request for single object
router.get('/:id', stockTransferController.findById);

// post request
router.post('/', validateTransfer, stockTransferController.save);

// put or patch request
router.patch('/update/:id', stockTransferController.updateById);
// status transition (approval flow)
router.patch('/:id/status', stockTransferController.transitionStatus);
// delete request (soft delete)
router.delete('/:id', stockTransferController.deleteById);
// restore request
router.post('/restore/:id', requireDeletePermission('stock_transfers'), stockTransferController.restoreById);

module.exports = router;
