const pool = require('../connection');
const stockService = require('../services/stockupdate');

const paginate = (rows, total, page, limit) => ({
    data: rows, total, page, totalPages: Math.ceil(total / limit)
});

const findAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM order_details ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM order_details')
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findByKeyword = async (req, res) => {
    const value = req.query.value;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    if (!value) return findAll(req, res);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM order_details WHERE CAST(productid AS TEXT) ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]),
            pool.query('SELECT COUNT(*) FROM order_details WHERE CAST(productid AS TEXT) ILIKE $1', [`%${value}%`])
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
    const { quantity, productid, unit_price, statusid, total_price, vendorid } = req.body;
    try {
        await pool.query('INSERT INTO order_details(quantity,productid,unit_price,statusid,total_price,vendorid,createdate) VALUES($1,$2,$3,$4,$5,$6,$7)',
            [quantity, productid, unit_price, statusid, total_price, vendorid, new Date()]);
        res.status(200).json({ message: 'order added sucessfully' });
    } catch (err) { res.status(500).json(err); }
    stockService.saveStock(productid, quantity);
};

const updateById = async (req, res) => {
    const { quantity, productid, unit_price, statusid, total_price, vendorid } = req.body;
    try {
        const result = await pool.query('UPDATE order_details SET quantity=$1,productid=$2,unit_price=$3,statusid=$4,total_price=$5,vendorid=$6 WHERE id=$7',
            [quantity, productid, unit_price, statusid, total_price, vendorid, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'order id does not match.' });
        res.status(200).json({ message: 'order updated sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM order_details WHERE id=$1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'order id does not match.' });
        res.status(200).json({ message: 'order deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const findLatest = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM order_details ORDER BY id DESC LIMIT 10');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const findTotalSale = async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM(total_price) AS sum FROM order_details');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findLatest, findTotalSale };
