const express = require('express');
const router = express.Router();
const roleController = require('../controller/roleController');
const permissionController = require('../controller/permissionController');
const { verifyToken, requireSuperAdmin } = require('../middleware/auth.middleware');

// All routes require super_admin
router.use(verifyToken, requireSuperAdmin);

router.get('/', roleController.findAll);
router.get('/:id', roleController.findById);
router.post('/', roleController.save);
router.patch('/update/:id', roleController.updateById);
router.delete('/:id', roleController.deleteById);

// Permissions
router.get('/:id/permissions', permissionController.getRolePermissions);
router.put('/:id/permissions', permissionController.updateRolePermissions);

module.exports = router;
