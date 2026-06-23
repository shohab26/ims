const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

/**
 * Middleware: Restrict access to super_admin role only.
 * Must be used AFTER verifyToken.
 */
const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role_name !== 'super_admin') {
        return res.status(403).json({ message: 'Forbidden. Super Admin access required.' });
    }
    next();
};

/**
 * Middleware: Check that the user has can_delete on the given module.
 *
 * Used on POST /<module>/:id/restore routes — restore is semantically the inverse
 * of delete, but POST maps to can_create via the standard method→column map, so
 * we can't reuse checkPermission(moduleName) as-is. This helper ignores req.method
 * and always checks can_delete. Super-admin bypasses, same as checkPermission.
 */
const requireDeletePermission = (moduleName) => {
    return async (req, res, next) => {
        if (req.user && req.user.role_name === 'super_admin') {
            return next();
        }
        try {
            const pool = require('../connection');
            const result = await pool.query(
                `SELECT rp.can_delete
                 FROM role_permissions rp
                 JOIN modules m ON rp.module_id = m.id
                 WHERE rp.role_id = $1 AND m.module_name = $2`,
                [req.user.role_id, moduleName]
            );
            if (result.rows.length > 0 && result.rows[0].can_delete === true) {
                return next();
            }
            return res.status(403).json({ message: 'Forbidden. You do not have permission to perform this action.' });
        } catch (err) {
            console.error('Permission check error:', err);
            return res.status(500).json({ message: 'Internal server error during permission check.' });
        }
    };
};

const permissionColumnsByMethod = Object.freeze({
    GET: 'can_view',
    POST: 'can_create',
    PATCH: 'can_update',
    PUT: 'can_update',
    DELETE: 'can_delete',
});

/**
 * Middleware: Check if user has permission for a specific module and action.
 */
const checkPermission = (moduleName) => {
    return async (req, res, next) => {
        // Super admin always has access
        if (req.user && req.user.role_name === 'super_admin') {
            return next();
        }

        const actionCol = permissionColumnsByMethod[req.method] || 'can_view';

        // Bypass strict API view checks for reference data so dropdowns and related names load correctly
        // on other pages (e.g., categories load on the products page).
        if (req.method === 'GET') {
            const referenceModules = ['categories', 'status', 'warehouse', 'vendors', 'customers', 'products'];
            if (referenceModules.includes(moduleName)) {
                return next();
            }
        }

        try {
            const pool = require('../connection');
            const result = await pool.query(
                `SELECT rp.${actionCol} 
                 FROM role_permissions rp
                 JOIN modules m ON rp.module_id = m.id
                 WHERE rp.role_id = $1 AND m.module_name = $2`,
                [req.user.role_id, moduleName]
            );

            if (result.rows.length > 0 && result.rows[0][actionCol] === true) {
                return next();
            }

            return res.status(403).json({ message: 'Forbidden. You do not have permission to perform this action.' });
        } catch (err) {
            console.error('Permission check error:', err);
            return res.status(500).json({ message: 'Internal server error during permission check.' });
        }
    };
};

module.exports = { verifyToken, requireSuperAdmin, checkPermission, requireDeletePermission };
