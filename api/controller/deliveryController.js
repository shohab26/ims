const pool = require('../connection');
const stockService = require('../services/stockupdate');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const VALID_TRANSITIONS = {
    pending:   ['packed', 'returned'],
    packed:    ['shipped', 'returned'],
    shipped:   ['delivered', 'returned'],
    delivered: [],
    returned:  [],
};

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query(`SELECT d.*, w.wname AS warehouse_name, u1.full_name AS created_by_name, u2.full_name AS updated_by_name,
                                u3.full_name AS status_changed_by_name
                        FROM delivery_details d
                        LEFT JOIN warehouses w ON w.id = d.warehouseid
                        LEFT JOIN users u1 ON u1.id = d.created_by
                        LEFT JOIN users u2 ON u2.id = d.updated_by
                        LEFT JOIN users u3 ON u3.id = d.status_changed_by
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
    const { quantity, productid, customerid, deliverydate, unit_price, total_price, tracking_number, shipping_address, carrier, warehouseid } = req.body;
    try {
        const stockRow = await pool.query('SELECT quantity FROM stocks WHERE productid=$1 AND warehouseid=$2 AND is_deleted=FALSE', [productid, warehouseid]);
        const available = stockRow.rows.length ? parseFloat(stockRow.rows[0].quantity) : 0;
        if (available < parseFloat(quantity)) {
            return res.status(400).json({ message: `Insufficient stock in the selected warehouse. Only ${available} unit(s) available for this product.` });
        }
        const result = await pool.query(
            `INSERT INTO delivery_details(quantity,productid,customerid,deliverydate,unit_price,total_price,
             warehouseid,shipment_status,tracking_number,shipping_address,carrier,createdate,created_by)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
            [quantity, productid, customerid, deliverydate, unit_price, total_price,
             warehouseid, 'pending', tracking_number || null, shipping_address || null, carrier || null, new Date(), req.user.id]);
        res.status(200).json({ message: 'delivery added sucessfully', id: result.rows[0].id });
        stockService.decreaseStock(productid, quantity, { userId: req.user.id, refType: 'delivery_details', refId: result.rows[0].id, warehouseid });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    const { quantity, productid, customerid, deliverydate, unit_price, total_price, tracking_number, shipping_address, carrier, warehouseid } = req.body;
    try {
        const existing = await pool.query('SELECT shipment_status FROM delivery_details WHERE id=$1 AND is_deleted=FALSE', [req.params.id]);
        if (existing.rowCount === 0) return res.status(404).json({ message: 'delivery id does not match.' });
        if (existing.rows[0].shipment_status !== 'pending') return res.status(400).json({ message: 'Only pending deliveries can be edited.' });
        await pool.query(
            `UPDATE delivery_details SET quantity=$1,productid=$2,customerid=$3,deliverydate=$4,unit_price=$5,
             total_price=$6,warehouseid=$7,tracking_number=$8,shipping_address=$9,carrier=$10,updated_by=$11 WHERE id=$12`,
            [quantity, productid, customerid, deliverydate, unit_price, total_price, warehouseid,
             tracking_number || null, shipping_address || null, carrier || null, req.user.id, req.params.id]);
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

const transitionStatus = async (req, res) => {
    const { status, tracking_number, shipping_address, carrier } = req.body;
    if (!status || !['pending','packed','shipped','delivered','returned'].includes(status)) {
        return res.status(400).json({ message: 'Invalid target status.' });
    }
    try {
        const existing = await pool.query('SELECT shipment_status FROM delivery_details WHERE id=$1 AND is_deleted=FALSE', [req.params.id]);
        if (existing.rowCount === 0) return res.status(404).json({ message: 'Delivery not found.' });

        const current = existing.rows[0].shipment_status;
        const allowed = VALID_TRANSITIONS[current];
        if (!allowed || !allowed.includes(status)) {
            return res.status(400).json({ message: `Cannot transition from '${current}' to '${status}'.`, allowed });
        }

        const setClauses = ['shipment_status=$1', 'status_changed_by=$2', 'status_changed_at=$3', 'updated_by=$2'];
        const params = [status, req.user.id, new Date()];
        let idx = 4;
        if (tracking_number !== undefined) { setClauses.push(`tracking_number=$${idx++}`); params.push(tracking_number); }
        if (shipping_address !== undefined) { setClauses.push(`shipping_address=$${idx++}`); params.push(shipping_address); }
        if (carrier !== undefined) { setClauses.push(`carrier=$${idx++}`); params.push(carrier); }
        params.push(req.params.id);

        await pool.query(`UPDATE delivery_details SET ${setClauses.join(',')} WHERE id=$${idx}`, params);
        res.status(200).json({ message: `Delivery status changed to '${status}'.`, shipment_status: status });
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findLatest, findTotalSale, findDeleted, restoreById: restoreByIdHandler, transitionStatus };
