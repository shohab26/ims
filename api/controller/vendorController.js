const pool = require('../connection');
const { getPagination, paginate } = require('../utils/pagination');

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query('SELECT * FROM vendors ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]),
            pool.query('SELECT COUNT(*) FROM vendors')
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
            pool.query('SELECT * FROM vendors WHERE address ILIKE $1 OR cell ILIKE $1 OR contact_person ILIKE $1 OR company ILIKE $1 OR email ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3', [`%${value}%`, limit, offset]),
            pool.query('SELECT COUNT(*) FROM vendors WHERE address ILIKE $1 OR cell ILIKE $1 OR contact_person ILIKE $1 OR company ILIKE $1 OR email ILIKE $1', [`%${value}%`])
        ]);
        res.status(200).json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vendors WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { address, cell, contact_person, company, email } = req.body;
    try {
        await pool.query('INSERT INTO vendors(address,cell,contact_person,company,email) VALUES($1,$2,$3,$4,$5)',
            [address, cell, contact_person, company, email]);
        res.status(200).json({ message: 'vendors added sucessfully' });
    } catch (err) { res.status(500).json(err); }
};

const updateById = async (req, res) => {
    const { address, cell, contact_person, company, email } = req.body;
    try {
        const result = await pool.query('UPDATE vendors SET address=$1,cell=$2,contact_person=$3,company=$4,email=$5 WHERE id=$6',
            [address, cell, contact_person, company, email, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'vendors id does not match.' });
        res.status(200).json({ message: 'vendors updated sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteById = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM vendors WHERE id=$1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'vendors id does not match.' });
        res.status(200).json({ message: 'vendors deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

module.exports = { findAll, findById, save, updateById, deleteById, findByKeyword };
