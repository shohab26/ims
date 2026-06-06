const pool = require('../connection');

const getRolePermissions = async (req, res) => {
    const roleId = req.params.id;
    try {
        // Fetch all modules and join with existing permissions if any
        const query = `
            SELECT 
                m.id as module_id, 
                m.module_name, 
                m.display_name,
                COALESCE(rp.can_view, false) as can_view,
                COALESCE(rp.can_create, false) as can_create,
                COALESCE(rp.can_update, false) as can_update,
                COALESCE(rp.can_delete, false) as can_delete
            FROM modules m
            LEFT JOIN role_permissions rp ON m.id = rp.module_id AND rp.role_id = $1
            ORDER BY m.id ASC
        `;
        const result = await pool.query(query, [roleId]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching permissions', error: err });
    }
};

const updateRolePermissions = async (req, res) => {
    const roleId = req.params.id;
    const { permissions } = req.body; // Array of { module_id, can_view, can_create, can_update, can_delete }
    
    if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: 'Permissions should be an array.' });
    }

    try {
        // We will execute a transaction
        await pool.query('BEGIN');

        // Delete existing permissions for this role
        await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

        // Insert new permissions
        for (const p of permissions) {
            await pool.query(
                `INSERT INTO role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [roleId, p.module_id, p.can_view, p.can_create, p.can_update, p.can_delete]
            );
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Permissions updated successfully.' });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ message: 'Error updating permissions', error: err });
    }
};

module.exports = { getRolePermissions, updateRolePermissions };
