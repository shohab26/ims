const pool = require('../connection');
const { getPagination, paginate } = require('../utils/pagination');

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const { user_id, entity_type, action, from, to } = req.query;

    const conditions = [];
    const params     = [];

    if (user_id)     { params.push(user_id);     conditions.push(`al.user_id = $${params.length}`); }
    if (entity_type) { params.push(entity_type); conditions.push(`al.entity_type = $${params.length}`); }
    if (action)      { params.push(action);       conditions.push(`al.action = $${params.length}`); }
    if (from)        { params.push(from);         conditions.push(`al.created_at >= $${params.length}`); }
    if (to)          { params.push(to);           conditions.push(`al.created_at <= $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
        params.push(limit);
        params.push(offset);
        const [data, count] = await Promise.all([
            pool.query(
                `SELECT al.*,
                        u.full_name  AS user_name,
                        u.email      AS user_email,
                        (COALESCE(al.new_data, al.old_data)->>'created_at')  AS record_created_at,
                        (COALESCE(al.new_data, al.old_data)->>'updated_at')  AS record_updated_at,
                        uc.full_name AS record_created_by_name,
                        uu.full_name AS record_updated_by_name
                 FROM activity_logs al
                 LEFT JOIN users u  ON u.id  = al.user_id
                 LEFT JOIN users uc ON uc.id = ((COALESCE(al.new_data, al.old_data)->>'created_by')::INTEGER)
                 LEFT JOIN users uu ON uu.id = ((COALESCE(al.new_data, al.old_data)->>'updated_by')::INTEGER)
                 ${where}
                 ORDER BY al.created_at DESC
                 LIMIT $${params.length - 1} OFFSET $${params.length}`,
                params
            ),
            pool.query(
                `SELECT COUNT(*) FROM activity_logs al ${where}`,
                params.slice(0, params.length - 2)
            ),
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT al.*, u.full_name AS user_name, u.email AS user_email
             FROM activity_logs al
             LEFT JOIN users u ON al.user_id = u.id
             WHERE al.id = $1`,
            [req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ message: 'Log not found.' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { findAll, findById };
