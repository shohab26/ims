const pool = require('../connection');
const stockService = require('../services/stockupdate');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    let client;
    try {
        client = await pool.connect();
        const data  = await client.query(`SELECT p.*, COALESCE(s.quantity, 0) AS stock_quantity,
                               u1.full_name AS created_by_name, u2.full_name AS updated_by_name
                        FROM products p
                        LEFT JOIN stocks s ON s.productid = p.id AND s.is_deleted = FALSE
                        LEFT JOIN users u1 ON u1.id = p.created_by
                        LEFT JOIN users u2 ON u2.id = p.updated_by
                        WHERE p.is_deleted=FALSE ORDER BY p.id DESC LIMIT $1 OFFSET $2`, [limit, offset]);
        const count = await client.query('SELECT COUNT(*) FROM products WHERE is_deleted=FALSE');
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json({ message: err.message }); }
    finally { client?.release(); }
};

const findByKeyword = async (req, res) => {
    const value = req.query.value;
    const { page, limit, offset } = getPagination(req.query);
    if (!value) return findAll(req, res);
    let client;
    try {
        client = await pool.connect();
        const data  = await client.query('SELECT * FROM products WHERE is_deleted=FALSE AND (pcode ILIKE $1 OR pname ILIKE $1 OR CAST(price AS TEXT) ILIKE $1) ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]);
        const count = await client.query('SELECT COUNT(*) FROM products WHERE is_deleted=FALSE AND (pcode ILIKE $1 OR pname ILIKE $1 OR CAST(price AS TEXT) ILIKE $1)', [`%${value}%`]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json({ message: err.message }); }
    finally { client?.release(); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    let client;
    try {
        client = await pool.connect();
        const data  = await client.query('SELECT * FROM products WHERE is_deleted=TRUE ORDER BY deleted_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        const count = await client.query('SELECT COUNT(*) FROM products WHERE is_deleted=TRUE');
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json({ message: err.message }); }
    finally { client?.release(); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { pcode, pname, pcate, price, reorder_level = 0, warehouseid, initial_quantity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products(pcode,pname,pcate,price,reorder_level,createdate,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
            [pcode, pname, pcate, price, reorder_level, new Date(), req.user.id]);
        const productId = result.rows[0].id;
        res.status(200).json({ message: 'Product added sucessfully', id: productId });

        // Optional convenience: seed initial stock for this product at creation time,
        // so a brand-new SKU doesn't require a separate trip to the Stocks module.
        if (warehouseid && initial_quantity && parseFloat(initial_quantity) > 0) {
            stockService.adjustStock(productId, initial_quantity, {
                userId: req.user.id, reason: 'initial', refType: 'products', refId: productId, warehouseid
            });
        }
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ message: 'Product code (SKU) is already in use.' });
        res.status(500).json(err);
    }
};

const updateById = async (req, res) => {
    const { pcode, pname, pcate, price, reorder_level = 0 } = req.body;
    try {
        const result = await pool.query('UPDATE products SET pcode=$1,pname=$2,pcate=$3,price=$4,reorder_level=$5,updated_by=$6 WHERE id=$7', [pcode, pname, pcate, price, reorder_level, req.user.id, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'Product id does not match.' });
        res.status(200).json({ message: 'Product updated sucessfully.' });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ message: 'Product code (SKU) is already in use.' });
        res.status(500).json(err);
    }
};

const deleteById = async (req, res) => {
    try {
        const rowCount = await softDeleteById(pool, 'products', req.params.id, req.user.id);
        if (rowCount === 0) return res.status(404).json({ message: 'Product id does not match.' });
        res.status(200).json({ message: 'Product deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const restoreByIdHandler = async (req, res) => {
    try {
        const rowCount = await restoreById(pool, 'products', req.params.id);
        if (rowCount === 0) return res.status(404).json({ message: 'Product id does not match or is not deleted.' });
        res.status(200).json({ message: 'Product restored sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const findLowStock = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.id, p.pcode, p.pname, p.reorder_level, COALESCE(SUM(s.quantity), 0) AS stock_quantity
             FROM products p
             LEFT JOIN stocks s ON s.productid = p.id AND s.is_deleted = FALSE
             WHERE p.is_deleted = FALSE AND p.reorder_level > 0
             GROUP BY p.id, p.pcode, p.pname, p.reorder_level
             HAVING COALESCE(SUM(s.quantity), 0) < p.reorder_level
             ORDER BY (p.reorder_level - COALESCE(SUM(s.quantity), 0)) DESC`
        );
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findDeleted, restoreById: restoreByIdHandler, findLowStock };
