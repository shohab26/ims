const pool = require('../connection');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const VALID_TRANSITIONS = {
    pending:   ['approved', 'rejected'],
    approved:  [],
    rejected:  [],
};

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query(`SELECT t.*, p.pname, p.pcode, wf.wname AS from_warehouse_name, wt.wname AS to_warehouse_name,
                               u1.full_name AS created_by_name, u2.full_name AS status_changed_by_name
                        FROM stock_transfers t
                        JOIN products p ON p.id = t.productid
                        JOIN warehouses wf ON wf.id = t.from_warehouse
                        JOIN warehouses wt ON wt.id = t.to_warehouse
                        LEFT JOIN users u1 ON u1.id = t.created_by
                        LEFT JOIN users u2 ON u2.id = t.status_changed_by
                        WHERE t.is_deleted=FALSE ORDER BY t.id DESC LIMIT $1 OFFSET $2`, [limit, offset]),
            pool.query('SELECT COUNT(*) FROM stock_transfers WHERE is_deleted=FALSE')
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
            pool.query(`SELECT t.*, p.pname, p.pcode FROM stock_transfers t
                        JOIN products p ON p.id = t.productid
                        WHERE t.is_deleted=FALSE AND (p.pcode ILIKE $1 OR t.status ILIKE $1)
                        ORDER BY t.id DESC LIMIT $2 OFFSET $3`, [`%${value}%`, limit, offset]),
            pool.query(`SELECT COUNT(*) FROM stock_transfers t JOIN products p ON p.id = t.productid
                        WHERE t.is_deleted=FALSE AND (p.pcode ILIKE $1 OR t.status ILIKE $1)`, [`%${value}%`])
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM stock_transfers WHERE is_deleted=TRUE ORDER BY deleted_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM stock_transfers WHERE is_deleted=TRUE')
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM stock_transfers WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { from_warehouse, to_warehouse, productid, qty } = req.body;
    if (!from_warehouse || !to_warehouse || !productid || !qty || parseFloat(qty) <= 0) {
        return res.status(400).json({ message: 'from_warehouse, to_warehouse, productid and a positive qty are required.' });
    }
    if (parseInt(from_warehouse) === parseInt(to_warehouse)) {
        return res.status(400).json({ message: 'from_warehouse and to_warehouse must be different.' });
    }
    try {
        const stockRow = await pool.query(
            'SELECT quantity FROM stocks WHERE productid=$1 AND warehouseid=$2 AND is_deleted=FALSE', [productid, from_warehouse]);
        const available = stockRow.rows.length ? parseFloat(stockRow.rows[0].quantity) : 0;
        if (available < parseFloat(qty)) {
            return res.status(400).json({ message: `Insufficient stock at source warehouse. Only ${available} unit(s) available.` });
        }

        const result = await pool.query(
            `INSERT INTO stock_transfers(from_warehouse,to_warehouse,productid,qty,status,created_by)
             VALUES($1,$2,$3,$4,'pending',$5) RETURNING id`,
            [from_warehouse, to_warehouse, productid, qty, req.user.id]);
        res.status(201).json({ message: 'Transfer request created.', id: result.rows[0].id });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    const { qty } = req.body;
    try {
        const existing = await pool.query('SELECT from_warehouse, productid, status FROM stock_transfers WHERE id=$1 AND is_deleted=FALSE', [req.params.id]);
        if (existing.rowCount === 0) return res.status(404).json({ message: 'Transfer not found.' });
        if (existing.rows[0].status !== 'pending') return res.status(400).json({ message: 'Only pending transfers can be edited.' });

        if (qty !== undefined) {
            const stockRow = await pool.query(
                'SELECT quantity FROM stocks WHERE productid=$1 AND warehouseid=$2 AND is_deleted=FALSE',
                [existing.rows[0].productid, existing.rows[0].from_warehouse]);
            const available = stockRow.rows.length ? parseFloat(stockRow.rows[0].quantity) : 0;
            if (parseFloat(qty) > available) {
                return res.status(400).json({ message: `Insufficient stock at source warehouse. Only ${available} unit(s) available.` });
            }
        }

        const result = await pool.query(
            'UPDATE stock_transfers SET qty=COALESCE($1,qty),updated_by=$2,updated_at=NOW() WHERE id=$3',
            [qty, req.user.id, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'Transfer id does not match.' });
        res.status(200).json({ message: 'Transfer updated successfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    try {
        const rowCount = await softDeleteById(pool, 'stock_transfers', req.params.id, req.user.id);
        if (rowCount === 0) return res.status(404).json({ message: 'Transfer id does not match.' });
        res.status(200).json({ message: 'Transfer deleted successfully.' });
    } catch (err) { res.status(500).json(err); }
};

const restoreByIdHandler = async (req, res) => {
    try {
        const rowCount = await restoreById(pool, 'stock_transfers', req.params.id);
        if (rowCount === 0) return res.status(404).json({ message: 'Transfer id does not match or is not deleted.' });
        res.status(200).json({ message: 'Transfer restored successfully.' });
    } catch (err) { res.status(500).json(err); }
};

const transitionStatus = async (req, res) => {
    const { status } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid target status.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const existing = await client.query(
            'SELECT from_warehouse, to_warehouse, productid, qty, status FROM stock_transfers WHERE id=$1 AND is_deleted=FALSE FOR UPDATE',
            [req.params.id]);
        if (existing.rowCount === 0) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Transfer not found.' }); }

        const { from_warehouse, to_warehouse, productid, qty, status: current } = existing.rows[0];
        const allowed = VALID_TRANSITIONS[current];
        if (!allowed || !allowed.includes(status)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Cannot transition from '${current}' to '${status}'.`, allowed });
        }

        if (status === 'approved') {
            // Lock the source stock row, re-check availability at the moment of approval
            // (time may have passed since the request was created and other movements may have happened).
            const fromStock = await client.query(
                'SELECT id, quantity FROM stocks WHERE productid=$1 AND warehouseid=$2 AND is_deleted=FALSE FOR UPDATE',
                [productid, from_warehouse]);
            const available = fromStock.rows.length ? parseFloat(fromStock.rows[0].quantity) : 0;
            if (available < parseFloat(qty)) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Insufficient stock at source warehouse. Only ${available} unit(s) available.` });
            }

            await client.query('UPDATE stocks SET quantity=$1,updatedate=NOW() WHERE id=$2',
                [available - parseFloat(qty), fromStock.rows[0].id]);

            // Find-or-create the destination stock row for this product/warehouse.
            const toStock = await client.query(
                'SELECT id, quantity FROM stocks WHERE productid=$1 AND warehouseid=$2 AND is_deleted=FALSE FOR UPDATE',
                [productid, to_warehouse]);
            if (toStock.rows.length) {
                await client.query('UPDATE stocks SET quantity=$1,updatedate=NOW() WHERE id=$2',
                    [parseFloat(toStock.rows[0].quantity) + parseFloat(qty), toStock.rows[0].id]);
            } else {
                await client.query(
                    'INSERT INTO stocks(quantity,productid,warehouseid,updatedate,created_by) VALUES($1,$2,$3,NOW(),$4)',
                    [qty, productid, to_warehouse, req.user.id]);
            }

            await client.query(
                `INSERT INTO stock_movements(productid,warehouseid,change,reason,ref_type,ref_id,created_by)
                 VALUES($1,$2,$3,'transfer','stock_transfers',$4,$5)`,
                [productid, from_warehouse, -parseFloat(qty), req.params.id, req.user.id]);
            await client.query(
                `INSERT INTO stock_movements(productid,warehouseid,change,reason,ref_type,ref_id,created_by)
                 VALUES($1,$2,$3,'transfer','stock_transfers',$4,$5)`,
                [productid, to_warehouse, parseFloat(qty), req.params.id, req.user.id]);
        }

        await client.query(
            'UPDATE stock_transfers SET status=$1, status_changed_by=$2, status_changed_at=NOW(), updated_by=$2 WHERE id=$3',
            [status, req.user.id, req.params.id]);

        await client.query('COMMIT');
        res.status(200).json({ message: `Transfer status changed to '${status}'.`, status });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json(err); }
    finally { client.release(); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findDeleted, restoreById: restoreByIdHandler, transitionStatus };
