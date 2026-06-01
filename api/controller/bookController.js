const pool = require('../connection');

const findAllBook = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM book');
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const getBookById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM book WHERE id=$1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) { res.status(500).json(err); }
};

const saveBook = async (req, res) => {
    const { name, price, dept_id } = req.body;
    try {
        await pool.query('INSERT INTO book(name,price,dept_id) VALUES($1,$2,$3)', [name, price, dept_id]);
        res.status(200).json({ message: 'Book added sucessfully' });
    } catch (err) { res.status(500).json(err); }
};

const updateBook = async (req, res) => {
    const { name, price, dept_id } = req.body;
    try {
        const result = await pool.query('UPDATE book SET name=$1,price=$2,dept_id=$3 WHERE id=$4', [name, price, dept_id, req.params.id]);
        if (result.rowCount === 0) return res.status(400).json({ message: 'book id does not match.' });
        res.status(200).json({ message: 'Book updated sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const deleteBook = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM book WHERE id=$1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'book id does not match.' });
        res.status(200).json({ message: 'Book deleted sucessfully.' });
    } catch (err) { res.status(500).json(err); }
};

const getBookNameById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM book WHERE id=$1', [req.params.id]);
        res.json(result.rows[0] || null);
    } catch (err) { res.status(500).json(err); }
};

module.exports = { getBookById, getBookNameById, saveBook, updateBook, deleteBook, findAllBook };
