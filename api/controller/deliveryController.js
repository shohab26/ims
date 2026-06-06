const pool = require('../connection');
const stockService = require('../services/stockupdate');
const { getPagination, paginate } = require('../utils/pagination');

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM delivery_details ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM delivery_details')
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
            pool.query('SELECT * FROM delivery_details WHERE CAST(productid AS TEXT) ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]),
            pool.query('SELECT COUNT(*) FROM delivery_details WHERE CAST(productid AS TEXT) ILIKE $1', [`%${value}%`])
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
        await pool.query('INSERT INTO delivery_details(quantity,productid,customerid,deliverydate,unit_price,total_price,statusid,createdate) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
            [quantity, productid, customerid, deliverydate, unit_price, total_price, statusid, new Date()]);
        res.status(200).json({ message: 'delivery added sucessfully' });
    } catch (err) { res.status(500).json(err); }
    stockService.decreaseStock(productid, quantity);
};

const updateById = async (req, res) => {
    const { quantity, productid, customerid, deliverydate, unit_price, total_price, statusid } = req.body;
    try {
        const result = await pool.query('UPDATE delivery_details SET quantity=$1,productid=$2,customerid=$3,deliverydate=$4,unit_price=$5,total_price=$6,statusid=$7 WHERE id=$8',
            [quantity, productid, customerid, deliverydate, unit_price, total_price, statusid, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'delivery id does not match.' });
        res.status(200).json({ message: 'delivery updated sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM delivery_details WHERE id=$1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'delivery id does not match.' });
        res.status(200).json({ message: 'delivery deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const findLatest = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM delivery_details ORDER BY id DESC LIMIT 10');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const findTotalSale = async (req, res) => {
    try {
        const result = await pool.query('SELECT SUM(total_price) AS sum FROM delivery_details');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findLatest, findTotalSale };
