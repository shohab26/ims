const express = require('express');
const { requireDeletePermission } = require('../middleware/auth.middleware');
const router = express.Router();
const ctrl = require('../controller/invoiceController');

router.get('/',            ctrl.findAll);
router.get('/search',      ctrl.findByKeyword);
router.get('/trash',       ctrl.findDeleted);
router.get('/:id',         ctrl.findById);
router.get('/:id/pdf',     ctrl.downloadPDF);
router.post('/:id/email',  ctrl.emailInvoice);
router.post('/',           ctrl.save);
router.patch('/update/:id', ctrl.updateById);
router.delete('/:id',      ctrl.deleteById);
router.post('/restore/:id', requireDeletePermission('invoices'), ctrl.restoreById);

module.exports = router;
