const pool = require('../connection');
const stockService = require('../services/stockupdate');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const VALID_TRANSITIONS = {
    requested: ['approved', 'rejected'],
    approved:  [],
    rejected:  [],
};

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query(`SELECT r.*, p.pname, p.pcode, d.customerid, c.customer_name, d.warehouseid, w.wname AS warehouse_name,
                               u1.full_name AS created_by_name, u2.full_name AS status_changed_by_name
                        FROM returns r
                        JOIN products p ON p.id = r.productid
                        JOIN delivery_details d ON d.id = r.delivery_id
                        LEFT JOIN customers c ON c.id = d.customerid
                        LEFT JOIN warehouses w ON w.id = d.warehouseid
                        LEFT JOIN users u1 ON u1.id = r.created_by
                        LEFT JOIN users u2 ON u2.id = r.status_changed_by
                        WHERE r.is_deleted=FALSE ORDER BY r.id DESC LIMIT $1 OFFSET $2`, [limit, offset]),
            pool.query('SELECT COUNT(*) FROM returns WHERE is_deleted=FALSE')
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
            pool.query(`SELECT r.*, p.pname, p.pcode FROM returns r
                        JOIN products p ON p.id = r.productid
                        WHERE r.is_deleted=FALSE AND (p.pcode ILIKE $1 OR r.status ILIKE $1)
                        ORDER BY r.id DESC LIMIT $2 OFFSET $3`, [`%${value}%`, limit, offset]),
            pool.query(`SELECT COUNT(*) FROM returns r JOIN products p ON p.id = r.productid
                        WHERE r.is_deleted=FALSE AND (p.pcode ILIKE $1 OR r.status ILIKE $1)`, [`%${value}%`])
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM returns WHERE is_deleted=TRUE ORDER BY deleted_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM returns WHERE is_deleted=TRUE')
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM returns WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

// A delivery can be over-returned across multiple requests, so we net out
// anything already requested/approved (rejected returns free the quantity back up).
const returnableQty = async (deliveryId, excludeReturnId = null) => {
    const delivery = await pool.query(
        'SELECT productid, quantity FROM delivery_details WHERE id=$1 AND is_deleted=FALSE', [deliveryId]);
    if (!delivery.rows.length) return null;

    const params = [deliveryId];
    let excludeClause = '';
    if (excludeReturnId) { params.push(excludeReturnId); excludeClause = `AND id <> $${params.length}`; }

    const already = await pool.query(
        `SELECT COALESCE(SUM(qty),0) AS qty FROM returns
         WHERE delivery_id=$1 AND is_deleted=FALSE AND status <> 'rejected' ${excludeClause}`, params);

    return {
        productid: delivery.rows[0].productid,
        deliveredQty: parseFloat(delivery.rows[0].quantity),
        alreadyReturned: parseFloat(already.rows[0].qty),
    };
};

const save = async (req, res) => {
    const { delivery_id, qty, reason } = req.body;
    if (!delivery_id || !qty || parseFloat(qty) <= 0) {
        return res.status(400).json({ message: 'delivery_id and a positive qty are required.' });
    }
    try {
        const info = await returnableQty(delivery_id);
        if (!info) return res.status(404).json({ message: 'Delivery not found.' });

        const available = info.deliveredQty - info.alreadyReturned;
        if (parseFloat(qty) > available) {
            return res.status(400).json({ message: `Cannot return ${qty} unit(s). Only ${available} unit(s) eligible for return on this delivery.` });
        }

        const result = await pool.query(
            `INSERT INTO returns(delivery_id,productid,qty,reason,status,created_by)
             VALUES($1,$2,$3,$4,'requested',$5) RETURNING id`,
            [delivery_id, info.productid, qty, reason || null, req.user.id]);
        res.status(201).json({ message: 'Return request created.', id: result.rows[0].id });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    const { qty, reason } = req.body;
    try {
        const existing = await pool.query('SELECT delivery_id, status FROM returns WHERE id=$1 AND is_deleted=FALSE', [req.params.id]);
        if (existing.rowCount === 0) return res.status(404).json({ message: 'Return not found.' });
        if (existing.rows[0].status !== 'requested') return res.status(400).json({ message: 'Only requested returns can be edited.' });

        if (qty !== undefined) {
            const info = await returnableQty(existing.rows[0].delivery_id, req.params.id);
            const available = info.deliveredQty - info.alreadyReturned;
            if (parseFloat(qty) > available) {
                return res.status(400).json({ message: `Cannot return ${qty} unit(s). Only ${available} unit(s) eligible for return on this delivery.` });
            }
        }

        const result = await pool.query(
            'UPDATE returns SET qty=COALESCE($1,qty),reason=COALESCE($2,reason),updated_by=$3,updated_at=NOW() WHERE id=$4',
            [qty, reason, req.user.id, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'Return id does not match.' });
        res.status(200).json({ message: 'Return updated successfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    try {
        const rowCount = await softDeleteById(pool, 'returns', req.params.id, req.user.id);
        if (rowCount === 0) return res.status(404).json({ message: 'Return id does not match.' });
        res.status(200).json({ message: 'Return deleted successfully.' });
    } catch (err) { res.status(500).json(err); }
};

const restoreByIdHandler = async (req, res) => {
    try {
        const rowCount = await restoreById(pool, 'returns', req.params.id);
        if (rowCount === 0) return res.status(404).json({ message: 'Return id does not match or is not deleted.' });
        res.status(200).json({ message: 'Return restored successfully.' });
    } catch (err) { res.status(500).json(err); }
};

const transitionStatus = async (req, res) => {
    const { status } = req.body;
    if (!status || !['requested', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid target status.' });
    }
    try {
        const existing = await pool.query(
            `SELECT r.productid, r.qty, r.status, d.warehouseid
             FROM returns r JOIN delivery_details d ON d.id = r.delivery_id
             WHERE r.id=$1 AND r.is_deleted=FALSE`, [req.params.id]);
        if (existing.rowCount === 0) return res.status(404).json({ message: 'Return not found.' });

        const current = existing.rows[0].status;
        const allowed = VALID_TRANSITIONS[current];
        if (!allowed || !allowed.includes(status)) {
            return res.status(400).json({ message: `Cannot transition from '${current}' to '${status}'.`, allowed });
        }

        await pool.query(
            'UPDATE returns SET status=$1, status_changed_by=$2, status_changed_at=NOW(), updated_by=$2 WHERE id=$3',
            [status, req.user.id, req.params.id]);

        if (status === 'approved') {
            // Restock into the same warehouse the original delivery shipped from.
            await stockService.adjustStock(existing.rows[0].productid, existing.rows[0].qty, {
                userId: req.user.id, reason: 'return', refType: 'returns', refId: req.params.id,
                warehouseid: existing.rows[0].warehouseid,
            });
        }

        res.status(200).json({ message: `Return status changed to '${status}'.`, status });
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findDeleted, restoreById: restoreByIdHandler, transitionStatus };
