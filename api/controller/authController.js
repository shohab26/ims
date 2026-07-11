const pool = require('../connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordChangeOtp } = require('../services/passwordSetupService');
require('dotenv').config();

const createTokenPayload = (user) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role_name: user.role_name,
    role_id: user.role_id,
});

const getPermissionsForUser = async (user) => {
    if (user.role_name === 'super_admin') {
        return [{ module_name: 'all', can_view: true, can_create: true, can_update: true, can_delete: true }];
    }

    if (!user.role_id) return [];

    const permResult = await pool.query(
        `SELECT m.module_name, rp.can_view, rp.can_create, rp.can_update, rp.can_delete
         FROM role_permissions rp
         JOIN modules m ON rp.module_id = m.id
         WHERE rp.role_id = $1`,
        [user.role_id]
    );
    return permResult.rows;
};

const issueLoginResponse = async (res, user) => {
    const payload = createTokenPayload(user);
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
    const permissions = await getPermissionsForUser(user);

    return res.status(200).json({
        token,
        user: payload,
        permissions
    });
};

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: { token, user: { id, full_name, email, role_name } }
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user with role info
        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.password_hash, u.is_active,
                    u.must_change_password,
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

        if (user.must_change_password) {
            await sendPasswordChangeOtp(user);
            return res.status(200).json({
                password_change_required: true,
                email: user.email,
                message: 'Password change required. A verification code has been sent to your email.'
            });
        }

        return issueLoginResponse(res, user);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err });
    }
};

/**
 * POST /auth/complete-password-change
 * Body: { email, otp, new_password }
 */
const completePasswordChange = async (req, res) => {
    const { email, otp, new_password } = req.body;

    try {
        const result = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.password_hash, u.is_active,
                    u.must_change_password, u.password_change_otp_hash,
                    u.password_change_otp_expires_at,
                    r.role_name, r.id as role_id
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid verification request.' });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account has been deactivated.' });
        }

        if (!user.must_change_password || !user.password_change_otp_hash || !user.password_change_otp_expires_at) {
            return res.status(400).json({ message: 'Password change is not required for this account.' });
        }

        const expiryCheck = await pool.query(
            'SELECT password_change_otp_expires_at > NOW() as is_valid FROM users WHERE id = $1',
            [user.id]
        );
        if (!expiryCheck.rows[0].is_valid) {
            return res.status(400).json({ message: 'OTP has expired. Please sign in again to receive a new code.' });
        }

        const otpMatch = await bcrypt.compare(String(otp), user.password_change_otp_hash);
        if (!otpMatch) {
            return res.status(401).json({ message: 'Invalid OTP.' });
        }

        const samePassword = await bcrypt.compare(new_password, user.password_hash);
        if (samePassword) {
            return res.status(400).json({ message: 'New password must be different from the temporary password.' });
        }

        const passwordHash = await bcrypt.hash(new_password, 10);
        await pool.query(
            `UPDATE users
             SET password_hash = $1,
                 must_change_password = FALSE,
                 password_change_otp_hash = NULL,
                 password_change_otp_expires_at = NULL
             WHERE id = $2`,
            [passwordHash, user.id]
        );

        return issueLoginResponse(res, user);
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

module.exports = { login, completePasswordChange, getMe };
