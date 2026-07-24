const pool = require('../connection');
const stockService = require('../services/stockupdate');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const VALID_TRANSITIONS = {
    draft:     ['sent', 'cancelled'],
    sent:      ['partial', 'received', 'cancelled'],
    partial:   ['received', 'cancelled'],
    received:  [],
    cancelled: [],
};

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query(`SELECT o.*, w.wname AS warehouse_name, u1.full_name AS created_by_name, u2.full_name AS updated_by_name,
                                u3.full_name AS status_changed_by_name
                        FROM order_details o
                        LEFT JOIN warehouses w ON w.id = o.warehouseid
                        LEFT JOIN users u1 ON u1.id = o.created_by
                        LEFT JOIN users u2 ON u2.id = o.updated_by
                        LEFT JOIN users u3 ON u3.id = o.status_changed_by
                        WHERE o.is_deleted=FALSE ORDER BY o.id DESC LIMIT $1 OFFSET $2`, [limit, offset]),
            pool.query('SELECT COUNT(*) FROM order_details WHERE is_deleted=FALSE')
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
            pool.query('SELECT * FROM order_details WHERE is_deleted=FALSE AND CAST(productid AS TEXT) ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]),
            pool.query('SELECT COUNT(*) FROM order_details WHERE is_deleted=FALSE AND CAST(productid AS TEXT) ILIKE $1', [`%${value}%`])
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM order_details WHERE is_deleted=TRUE ORDER BY deleted_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM order_details WHERE is_deleted=TRUE')
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM order_details WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { quantity, productid, unit_price, total_price, vendorid, warehouseid } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO order_details(quantity,productid,unit_price,total_price,vendorid,warehouseid,po_status,createdate,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
            [quantity, productid, unit_price, total_price, vendorid, warehouseid, 'draft', new Date(), req.user.id]);
        res.status(200).json({ message: 'order added sucessfully', id: result.rows[0].id });
        stockService.saveStock(productid, quantity, { userId: req.user.id, refType: 'order_details', refId: result.rows[0].id, warehouseid });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    const { quantity, productid, unit_price, total_price, vendorid, warehouseid } = req.body;
    try {
        const existing = await pool.query('SELECT po_status FROM order_details WHERE id=$1 AND is_deleted=FALSE', [req.params.id]);
        if (existing.rowCount === 0) return res.status(404).json({ message: 'order id does not match.' });
        if (existing.rows[0].po_status !== 'draft') return res.status(400).json({ message: 'Only draft orders can be edited.' });
        const result = await pool.query('UPDATE order_details SET quantity=$1,productid=$2,unit_price=$3,total_price=$4,vendorid=$5,warehouseid=$6,updated_by=$7 WHERE id=$8',
            [quantity, productid, unit_price, total_price, vendorid, warehouseid, req.user.id, req.params.id]);
        res.status(200).json({ message: 'order updated sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    // NOTE: Pre-existing behavior — soft-deleting an order does NOT revert the
    // stock increment that stockService.saveStock applied on save. This is
    // flagged for the "stock movement history" feature; out of scope here.
    try {
        const rowCount = await softDeleteById(pool, 'order_details', req.params.id, req.user.id);
        if (rowCount === 0) return res.status(404).json({ message: 'order id does not match.' });
        res.status(200).json({ message: 'order deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const restoreByIdHandler = async (req, res) => {
    try {
        const rowCount = await restoreById(pool, 'order_details', req.params.id);
        if (rowCount === 0) return res.status(404).json({ message: 'order id does not match or is not deleted.' });
        res.status(200).json({ message: 'order restored sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const findLatest = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM order_details WHERE is_deleted=FALSE ORDER BY id DESC LIMIT 10');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const findTotalSale = async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM(total_price) AS sum FROM order_details WHERE is_deleted=FALSE');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const transitionStatus = async (req, res) => {
    const { status } = req.body;
    if (!status || !['draft','sent','partial','received','cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid target status.' });
    }
    try {
        const existing = await pool.query('SELECT po_status FROM order_details WHERE id=$1 AND is_deleted=FALSE', [req.params.id]);
        if (existing.rowCount === 0) return res.status(404).json({ message: 'Order not found.' });

        const current = existing.rows[0].po_status;
        const allowed = VALID_TRANSITIONS[current];
        if (!allowed || !allowed.includes(status)) {
            return res.status(400).json({ message: `Cannot transition from '${current}' to '${status}'.`, allowed });
        }

        await pool.query(
            'UPDATE order_details SET po_status=$1, status_changed_by=$2, status_changed_at=$3, updated_by=$2 WHERE id=$4',
            [status, req.user.id, new Date(), req.params.id]
        );
        res.status(200).json({ message: `Order status changed to '${status}'.`, po_status: status });
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findLatest, findTotalSale, findDeleted, restoreById: restoreByIdHandler, transitionStatus, VALID_TRANSITIONS };
