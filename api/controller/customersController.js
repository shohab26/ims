const pool = require('../connection');
const { getPagination, paginate } = require('../utils/pagination');
const { softDeleteById, restoreById } = require('../utils/softDelete');

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    let client;
    try {
        client = await pool.connect();
        const data  = await client.query(`SELECT c.*, u1.full_name AS created_by_name, u2.full_name AS updated_by_name
                        FROM customers c
                        LEFT JOIN users u1 ON u1.id = c.created_by
                        LEFT JOIN users u2 ON u2.id = c.updated_by
                        WHERE c.is_deleted=FALSE ORDER BY c.id DESC LIMIT $1 OFFSET $2`, [limit, offset]);
        const count = await client.query('SELECT COUNT(*) FROM customers WHERE is_deleted=FALSE');
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
        const data  = await client.query('SELECT * FROM customers WHERE is_deleted=FALSE AND (address ILIKE $1 OR phone ILIKE $1 OR customer_name ILIKE $1 OR email ILIKE $1) ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]);
        const count = await client.query('SELECT COUNT(*) FROM customers WHERE is_deleted=FALSE AND (address ILIKE $1 OR phone ILIKE $1 OR customer_name ILIKE $1 OR email ILIKE $1)', [`%${value}%`]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json({ message: err.message }); }
    finally { client?.release(); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    let client;
    try {
        client = await pool.connect();
        const data  = await client.query('SELECT * FROM customers WHERE is_deleted=TRUE ORDER BY deleted_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        const count = await client.query('SELECT COUNT(*) FROM customers WHERE is_deleted=TRUE');
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json({ message: err.message }); }
    finally { client?.release(); }
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
        await pool.query('INSERT INTO customers(address,phone,customer_name,email,created_by) VALUES($1,$2,$3,$4,$5)', [address, phone, customer_name, email, req.user.id]);
        res.status(200).json({ message: 'customers added sucessfully' });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    const { address, phone, customer_name, email } = req.body;
    try {
        const result = await pool.query('UPDATE customers SET address=$1,phone=$2,customer_name=$3,email=$4,updated_by=$5 WHERE id=$6', [address, phone, customer_name, email, req.user.id, req.params.id]);
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
