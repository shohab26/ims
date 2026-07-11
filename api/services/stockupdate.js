const pool = require('../connection');

async function getStockById(productid) {
    const result = await pool.query('SELECT * FROM stocks WHERE productid=$1', [productid]);
    return result.rows[0] || null;
}

async function recordMovement(productid, warehouseid, change, reason, refType, refId, userId) {
    await pool.query(
        `INSERT INTO stock_movements(productid, warehouseid, change, reason, ref_type, ref_id, created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [productid, warehouseid, change, reason, refType, refId, userId]
    );
}

async function saveStock(productid, quantity, { userId = null, refType = 'order_details', refId = null } = {}) {
    try {
        const stock = await getStockById(productid);
        const now = new Date();
        const warehouseid = stock ? stock.warehouseid : 1;
        if (stock) {
            await pool.query('UPDATE stocks SET quantity=$1,updatedate=$2 WHERE productid=$3',
                [parseFloat(stock.quantity) + parseFloat(quantity), now, productid]);
        } else {
            await pool.query('INSERT INTO stocks(quantity,productid,warehouseid,updatedate) VALUES($1,$2,$3,$4)',
                [quantity, productid, 1, now]);
        }
        await recordMovement(productid, warehouseid, parseFloat(quantity), 'order', refType, refId, userId);
    } catch (err) {
        console.error('saveStock error:', err);
    }
}

async function decreaseStock(productid, quantity, { userId = null, refType = 'delivery_details', refId = null } = {}) {
    try {
        const stock = await getStockById(productid);
        const available = stock ? parseFloat(stock.quantity) : 0;
        if (available < parseFloat(quantity)) {
            throw new Error(`Insufficient stock. Only ${available} unit(s) available.`);
        }
        const now = new Date();
        const warehouseid = stock.warehouseid;
        await pool.query('UPDATE stocks SET quantity=$1,updatedate=$2 WHERE productid=$3',
            [available - parseFloat(quantity), now, productid]);
        await recordMovement(productid, warehouseid, -parseFloat(quantity), 'delivery', refType, refId, userId);
    } catch (err) {
        console.error('decreaseStock error:', err.message);
        throw err;
    }
}

async function adjustStock(productid, change, { userId = null, reason = 'adjustment', refType = 'stocks', refId = null } = {}) {
    try {
        const stock = await getStockById(productid);
        const now = new Date();
        const warehouseid = stock ? stock.warehouseid : 1;
        if (stock) {
            await pool.query('UPDATE stocks SET quantity=$1,updatedate=$2 WHERE productid=$3',
                [parseFloat(stock.quantity) + parseFloat(change), now, productid]);
        }
        await recordMovement(productid, warehouseid, parseFloat(change), reason, refType, refId, userId);
    } catch (err) {
        console.error('adjustStock error:', err);
    }
}

module.exports = { saveStock, decreaseStock, adjustStock };
