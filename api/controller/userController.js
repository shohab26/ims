const pool = require('../connection');
const bcrypt = require('bcryptjs');
const { sendPasswordChangeOtp } = require('../services/passwordSetupService');

const findAll = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.is_active, u.must_change_password, u.created_at,
                    r.id as role_id, r.role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             ORDER BY u.id DESC`
        );
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.is_active, u.must_change_password, u.created_at,
                    r.id as role_id, r.role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id=$1`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json(result.rows[0]);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { full_name, email, password, role_id, is_active } = req.body;
    if (!full_name || !email || !password || !role_id) {
        return res.status(400).json({ message: 'full_name, email, password, and role_id are required.' });
    }
    const client = await pool.connect();
    try {
        const password_hash = await bcrypt.hash(password, 10);
        await client.query('BEGIN');
        const result = await client.query(
            `INSERT INTO users(full_name, email, password_hash, role_id, is_active, must_change_password)
             VALUES($1, $2, $3, $4, $5, TRUE)
             RETURNING id, full_name, email`,
            [full_name, email, password_hash, role_id, is_active !== undefined ? is_active : true]
        );
        await sendPasswordChangeOtp(result.rows[0], client);
        await client.query('COMMIT');
        res.status(200).json({ message: 'User created successfully. An OTP has been sent to the user email.' });
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') return res.status(409).json({ message: 'Email already exists.' });
        res.status(500).json({ message: err.message || 'Failed to create user.', error: err });
    } finally {
        client.release();
    }
};

const updateById = async (req, res) => {
    const { full_name, email, password, role_id, is_active } = req.body;
    try {
        let query, params;
        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            query = 'UPDATE users SET full_name=$1, email=$2, password_hash=$3, role_id=$4, is_active=$5 WHERE id=$6';
            params = [full_name, email, password_hash, role_id, is_active, req.params.id];
        } else {
            query = 'UPDATE users SET full_name=$1, email=$2, role_id=$3, is_active=$4 WHERE id=$5';
            params = [full_name, email, role_id, is_active, req.params.id];
        }
        const result = await pool.query(query, params);
        if (result.rowCount === 0) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json({ message: 'User updated successfully.' });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ message: 'Email already exists.' });
        res.status(500).json(err);
    }
};

const deleteById = async (req, res) => {
    try {
        // Prevent deleting the currently logged-in user
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account.' });
        }
        const result = await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById };
