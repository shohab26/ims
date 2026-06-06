const pool = require('../connection');

const findAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM roles ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM roles WHERE id=$1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Role not found.' });
        res.status(200).json(result.rows[0]);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { role_name, description } = req.body;
    if (!role_name) return res.status(400).json({ message: 'role_name is required.' });
    try {
        await pool.query(
            'INSERT INTO roles(role_name, description) VALUES($1, $2)',
            [role_name.trim().toLowerCase().replace(/\s+/g, '_'), description || null]
        );
        res.status(200).json({ message: 'Role created successfully.' });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ message: 'Role name already exists.' });
        res.status(500).json(err);
    }
};

const updateById = async (req, res) => {
    const { role_name, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE roles SET role_name=$1, description=$2 WHERE id=$3',
            [role_name.trim().toLowerCase().replace(/\s+/g, '_'), description || null, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: 'Role not found.' });
        res.status(200).json({ message: 'Role updated successfully.' });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ message: 'Role name already exists.' });
        res.status(500).json(err);
    }
};

const deleteById = async (req, res) => {
    try {
        // Prevent deleting super_admin
        const check = await pool.query('SELECT role_name FROM roles WHERE id=$1', [req.params.id]);
        if (check.rows.length > 0 && check.rows[0].role_name === 'super_admin') {
            return res.status(400).json({ message: 'Cannot delete the super_admin role.' });
        }
        const result = await pool.query('DELETE FROM roles WHERE id=$1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Role not found.' });
        res.status(200).json({ message: 'Role deleted successfully.' });
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById };
