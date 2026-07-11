const pool = require('../connection');
const stockService = require('../services/stockupdate');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query(`SELECT d.*, u1.full_name AS created_by_name, u2.full_name AS updated_by_name
                        FROM delivery_details d
                        LEFT JOIN users u1 ON u1.id = d.created_by
                        LEFT JOIN users u2 ON u2.id = d.updated_by
                        WHERE d.is_deleted=FALSE ORDER BY d.id DESC LIMIT $1 OFFSET $2`, [limit, offset]),
            pool.query('SELECT COUNT(*) FROM delivery_details WHERE is_deleted=FALSE')
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
            pool.query('SELECT * FROM delivery_details WHERE is_deleted=FALSE AND CAST(productid AS TEXT) ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]),
            pool.query('SELECT COUNT(*) FROM delivery_details WHERE is_deleted=FALSE AND CAST(productid AS TEXT) ILIKE $1', [`%${value}%`])
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM delivery_details WHERE is_deleted=TRUE ORDER BY deleted_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM delivery_details WHERE is_deleted=TRUE')
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM delivery_details WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { quantity, productid, customerid, deliverydate, unit_price, total_price, statusid } = req.body;
    try {
        const stockRow = await pool.query('SELECT quantity FROM stocks WHERE productid=$1 AND is_deleted=FALSE', [productid]);
        const available = stockRow.rows.length ? parseFloat(stockRow.rows[0].quantity) : 0;
        if (available < parseFloat(quantity)) {
            return res.status(400).json({ message: `Insufficient stock. Only ${available} unit(s) available for this product.` });
        }
        const result = await pool.query(
            'INSERT INTO delivery_details(quantity,productid,customerid,deliverydate,unit_price,total_price,statusid,createdate,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
            [quantity, productid, customerid, deliverydate, unit_price, total_price, statusid, new Date(), req.user.id]);
        res.status(200).json({ message: 'delivery added sucessfully' });
        stockService.decreaseStock(productid, quantity, { userId: req.user.id, refType: 'delivery_details', refId: result.rows[0].id });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    const { quantity, productid, customerid, deliverydate, unit_price, total_price, statusid } = req.body;
    try {
        const result = await pool.query('UPDATE delivery_details SET quantity=$1,productid=$2,customerid=$3,deliverydate=$4,unit_price=$5,total_price=$6,statusid=$7,updated_by=$8 WHERE id=$9',
            [quantity, productid, customerid, deliverydate, unit_price, total_price, statusid, req.user.id, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'delivery id does not match.' });
        res.status(200).json({ message: 'delivery updated sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    // NOTE: Pre-existing behavior — soft-deleting a delivery does NOT restore
    // the stock decrement that stockService.decreaseStock applied on save.
    // Flagged for the "stock movement history" feature; out of scope here.
    try {
        const rowCount = await softDeleteById(pool, 'delivery_details', req.params.id, req.user.id);
        if (rowCount === 0) return res.status(404).json({ message: 'delivery id does not match.' });
        res.status(200).json({ message: 'delivery deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const restoreByIdHandler = async (req, res) => {
    try {
        const rowCount = await restoreById(pool, 'delivery_details', req.params.id);
        if (rowCount === 0) return res.status(404).json({ message: 'delivery id does not match or is not deleted.' });
        res.status(200).json({ message: 'delivery restored sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const findLatest = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM delivery_details WHERE is_deleted=FALSE ORDER BY id DESC LIMIT 10');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const findTotalSale = async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM(total_price) AS sum FROM delivery_details WHERE is_deleted=FALSE');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findLatest, findTotalSale, findDeleted, restoreById: restoreByIdHandler };
