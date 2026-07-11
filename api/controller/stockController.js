const pool = require('../connection');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query(`SELECT s.*, u1.full_name AS created_by_name, u2.full_name AS updated_by_name
                        FROM stocks s
                        LEFT JOIN users u1 ON u1.id = s.created_by
                        LEFT JOIN users u2 ON u2.id = s.updated_by
                        WHERE s.is_deleted=FALSE ORDER BY s.id DESC LIMIT $1 OFFSET $2`, [limit, offset]),
            pool.query('SELECT COUNT(*) FROM stocks WHERE is_deleted=FALSE')
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findByKeyword = async (req, res) => {
    const value = req.query.value;
    const { page, limit, offset } = getPagination(req.query);
    if (!value) return findAll(req, res);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM stocks WHERE is_deleted=FALSE AND (CAST(quantity AS TEXT) ILIKE $1 OR CAST(productid AS TEXT) ILIKE $1 OR CAST(warehouseid AS TEXT) ILIKE $1) ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]),
            pool.query('SELECT COUNT(*) FROM stocks WHERE is_deleted=FALSE AND (CAST(quantity AS TEXT) ILIKE $1 OR CAST(productid AS TEXT) ILIKE $1 OR CAST(warehouseid AS TEXT) ILIKE $1)', [`%${value}%`])
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM stocks WHERE is_deleted=TRUE ORDER BY deleted_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM stocks WHERE is_deleted=TRUE')
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM stocks WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { quantity, productid, warehouseid } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO stocks(quantity,productid,warehouseid,updatedate,created_by) VALUES($1,$2,$3,$4,$5) RETURNING id',
            [quantity, productid, warehouseid, new Date(), req.user.id]);
        await pool.query(
            'INSERT INTO stock_movements(productid,warehouseid,change,reason,ref_type,ref_id,created_by) VALUES($1,$2,$3,$4,$5,$6,$7)',
            [productid, warehouseid, parseFloat(quantity), 'adjustment', 'stocks', result.rows[0].id, req.user.id]);
        res.status(200).json({ message: 'stocks added sucessfully' });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    const { quantity, productid, warehouseid } = req.body;
    try {
        const old = await pool.query('SELECT quantity, warehouseid FROM stocks WHERE id=$1', [req.params.id]);
        const result = await pool.query(
            'UPDATE stocks SET quantity=$1,productid=$2,warehouseid=$3,updatedate=$4,updated_by=$5 WHERE id=$6',
            [quantity, productid, warehouseid, new Date(), req.user.id, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'stocks id does not match.' });
        if (old.rows.length) {
            const delta = parseFloat(quantity) - parseFloat(old.rows[0].quantity);
            await pool.query(
                'INSERT INTO stock_movements(productid,warehouseid,change,reason,ref_type,ref_id,created_by) VALUES($1,$2,$3,$4,$5,$6,$7)',
                [productid, warehouseid, delta, 'adjustment', 'stocks', parseInt(req.params.id), req.user.id]);
        }
        res.status(200).json({ message: 'stocks updated sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    try {
        const rowCount = await softDeleteById(pool, 'stocks', req.params.id, req.user.id);
        if (rowCount === 0) return res.status(404).json({ message: 'stocks id does not match.' });
        res.status(200).json({ message: 'stocks deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const restoreByIdHandler = async (req, res) => {
    try {
        const rowCount = await restoreById(pool, 'stocks', req.params.id);
        if (rowCount === 0) return res.status(404).json({ message: 'stocks id does not match or is not deleted.' });
        res.status(200).json({ message: 'stocks restored sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findDeleted, restoreById: restoreByIdHandler };
