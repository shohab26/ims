const express    = require('express');
const router     = express.Router();
const { findAll, findById } = require('../controller/activityLogController');

// Super-admin only — verifyToken + requireSuperAdmin applied in index.js
router.get('/',    findAll);
router.get('/:id', findById);

module.exports = router;
