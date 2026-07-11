const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/stockMovementController');

router.get('/',            ctrl.findAll);
router.get('/:productid',  ctrl.findByProductId);

module.exports = router;
