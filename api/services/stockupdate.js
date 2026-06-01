const pool = require('../connection');

async function getStockById(productid) {
    const result = await pool.query('SELECT * FROM stocks WHERE productid=$1', [productid]);
    return result.rows[0] || null;
}

async function saveStock(productid, quantity) {
    try {
        const stock = await getStockById(productid);
        const now = new Date();
        if (stock) {
            await pool.query('UPDATE stocks SET quantity=$1,updatedate=$2 WHERE productid=$3',
                [parseFloat(stock.quantity) + parseFloat(quantity), now, productid]);
            console.log('Stock updated successfully.');
        } else {
            await pool.query('INSERT INTO stocks(quantity,productid,warehouseid,updatedate) VALUES($1,$2,$3,$4)',
                [quantity, productid, 1, now]);
            console.log('Stock added successfully.');
        }
    } catch (err) {
        console.error('saveStock error:', err);
    }
}

async function decreaseStock(productid, quantity) {
    try {
        const stock = await getStockById(productid);
        const now = new Date();
        if (stock) {
            await pool.query('UPDATE stocks SET quantity=$1,updatedate=$2 WHERE productid=$3',
                [parseFloat(stock.quantity) - parseFloat(quantity), now, productid]);
            console.log('Stock updated successfully.');
        } else {
            await pool.query('INSERT INTO stocks(quantity,productid,warehouseid,updatedate) VALUES($1,$2,$3,$4)',
                [-quantity, productid, 1, now]);
            console.log('Stock added successfully.');
        }
    } catch (err) {
        console.error('decreaseStock error:', err);
    }
}

module.exports = { saveStock, decreaseStock };
