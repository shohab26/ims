const pool = require('../connection');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM customers WHERE is_deleted=FALSE ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM customers WHERE is_deleted=FALSE')
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
            pool.query('SELECT * FROM customers WHERE is_deleted=FALSE AND (address ILIKE $1 OR phone ILIKE $1 OR customer_name ILIKE $1 OR email ILIKE $1) ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]),
            pool.query('SELECT COUNT(*) FROM customers WHERE is_deleted=FALSE AND (address ILIKE $1 OR phone ILIKE $1 OR customer_name ILIKE $1 OR email ILIKE $1)', [`%${value}%`])
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM customers WHERE is_deleted=TRUE ORDER BY deleted_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM customers WHERE is_deleted=TRUE')
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { address, phone, customer_name, email } = req.body;
    try {
        await pool.query('INSERT INTO customers(address,phone,customer_name,email) VALUES($1,$2,$3,$4)', [address, phone, customer_name, email]);
        res.status(200).json({ message: 'customers added sucessfully' });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    const { address, phone, customer_name, email } = req.body;
    try {
        const result = await pool.query('UPDATE customers SET address=$1,phone=$2,customer_name=$3,email=$4 WHERE id=$5', [address, phone, customer_name, email, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'customers id does not match.' });
        res.status(200).json({ message: 'customers updated sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    try {
        const rowCount = await softDeleteById(pool, 'customers', req.params.id, req.user.id);
        if (rowCount === 0) return res.status(404).json({ message: 'customers id does not match.' });
        res.status(200).json({ message: 'customers deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const restoreByIdHandler = async (req, res) => {
    try {
        const rowCount = await restoreById(pool, 'customers', req.params.id);
        if (rowCount === 0) return res.status(404).json({ message: 'customers id does not match or is not deleted.' });
        res.status(200).json({ message: 'customers restored sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword, findDeleted, restoreById: restoreByIdHandler };
