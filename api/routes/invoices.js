const express = require('express');
const router = express.Router();
const ctrl = require('../controller/invoiceController');

router.get('/',            ctrl.findAll);
router.get('/search',      ctrl.findByKeyword);
router.get('/:id',         ctrl.findById);
router.get('/:id/pdf',     ctrl.downloadPDF);
router.post('/',           ctrl.save);
router.patch('/update/:id', ctrl.updateById);
router.delete('/:id',      ctrl.deleteById);

module.exports = router;
