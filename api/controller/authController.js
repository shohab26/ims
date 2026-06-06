const pool = require('../connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: { token, user: { id, full_name, email, role_name } }
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Find user with role info
        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.password_hash, u.is_active,
                    r.role_name, r.id as role_id
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account has been deactivated.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Sign JWT
        const payload = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role_name: user.role_name,
            role_id: user.role_id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '8h',
        });

        // Fetch permissions for the role
        let permissions = [];
        if (user.role_name === 'super_admin') {
            // super_admin has all permissions
            permissions = [{ module_name: 'all', can_view: true, can_create: true, can_update: true, can_delete: true }];
        } else if (user.role_id) {
            const permResult = await pool.query(
                `SELECT m.module_name, rp.can_view, rp.can_create, rp.can_update, rp.can_delete
                 FROM role_permissions rp
                 JOIN modules m ON rp.module_id = m.id
                 WHERE rp.role_id = $1`,
                [user.role_id]
            );
            permissions = permResult.rows;
        }

        res.status(200).json({
            token,
            user: payload,
            permissions
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};

/**
 * GET /auth/me
 * Returns the currently authenticated user info from token.
 */
const getMe = (req, res) => {
    res.status(200).json({ user: req.user });
};

module.exports = { login, getMe };
