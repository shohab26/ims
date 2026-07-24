const pool = require('../connection');
const emailService = require('./emailService');

// Recipients are super_admin accounts — the same audience that already gets
// admin-only actions elsewhere in this app (see requireSuperAdmin).
const getRecipients = async () => {
    const r = await pool.query(
        `SELECT u.email FROM users u
         JOIN roles ro ON ro.id = u.role_id
         WHERE ro.role_name = 'super_admin' AND u.is_active = TRUE AND u.email IS NOT NULL`
    );
    return r.rows.map(row => row.email).filter(Boolean);
};

const notifyLowStock = async ({ pname, pcode, quantity, reorder_level }) => {
    try {
        const recipients = await getRecipients();
        if (!recipients.length) return;
        await emailService.sendLowStockAlertEmail({ to: recipients.join(','), pname, pcode, quantity, reorder_level });
    } catch (err) {
        console.error('Low-stock alert email failed:', err.message);
    }
};

module.exports = { notifyLowStock };
