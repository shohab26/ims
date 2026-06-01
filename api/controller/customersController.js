const pool = require('../connection');

const paginate = (rows, total, page, limit) => ({
    data: rows, total, page, totalPages: Math.ceil(total / limit)
});

const findAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM customers ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM customers')
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
            pool.query('SELECT * FROM customers WHERE address ILIKE $1 OR phone ILIKE $1 OR customer_name ILIKE $1 OR email ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]),
            pool.query('SELECT COUNT(*) FROM customers WHERE address ILIKE $1 OR phone ILIKE $1 OR customer_name ILIKE $1 OR email ILIKE $1', [`%${value}%`])
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
        const result = await pool.query('DELETE FROM customers WHERE id=$1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'customers id does not match.' });
        res.status(200).json({ message: 'customers deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword };
