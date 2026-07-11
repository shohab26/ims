const pool = require('../connection');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    let client;
    try {
        client = await pool.connect();
        const data  = await client.query(`SELECT w.*, u1.full_name AS created_by_name, u2.full_name AS updated_by_name
                        FROM warehouses w
                        LEFT JOIN users u1 ON u1.id = w.created_by
                        LEFT JOIN users u2 ON u2.id = w.updated_by
                        WHERE w.is_deleted=FALSE ORDER BY w.id DESC LIMIT $1 OFFSET $2`, [limit, offset]);
        const count = await client.query('SELECT COUNT(*) FROM warehouses WHERE is_deleted=FALSE');
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json({ message: err.message }); }
    finally { client?.release(); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM warehouses WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    try {
        await pool.query('INSERT INTO warehouses(wname,created_by) VALUES($1,$2)', [req.body.wname, req.user.id]);
        res.status(200).json({ message: 'warehouse added sucessfully' });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    try {
        const result = await pool.query('UPDATE warehouses SET wname=$1,updated_by=$2 WHERE id=$3', [req.body.wname, req.user.id, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'warehouse id does not match.' });
        res.status(200).json({ message: 'warehouse updated sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    try {
        const rowCount = await softDeleteById(pool, 'warehouses', req.params.id, req.user.id);
        if (rowCount === 0) return res.status(404).json({ message: 'warehouse id does not match.' });
        res.status(200).json({ message: 'warehouse deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const restoreByIdHandler = async (req, res) => {
    try {
        const rowCount = await restoreById(pool, 'warehouses', req.params.id);
        if (rowCount === 0) return res.status(404).json({ message: 'warehouse id does not match or is not deleted.' });
        res.status(200).json({ message: 'warehouse restored sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const findByKeyword = async (req, res) => {
    const value = req.query.value;
    const { page, limit, offset } = getPagination(req.query);
    if (!value) return findAll(req, res);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM warehouses WHERE is_deleted=FALSE AND wname ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]),
            pool.query('SELECT COUNT(*) FROM warehouses WHERE is_deleted=FALSE AND wname ILIKE $1', [`%${value}%`])
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM warehouses WHERE is_deleted=TRUE ORDER BY deleted_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM warehouses WHERE is_deleted=TRUE')
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findDeleted, restoreById: restoreByIdHandler };
