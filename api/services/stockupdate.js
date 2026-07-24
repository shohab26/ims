const pool = require('../connection');
const lowStockAlert = require('./lowStockAlert');

async function getStockRow(productid, warehouseid) {
    const result = await pool.query(
        'SELECT * FROM stocks WHERE productid=$1 AND warehouseid=$2 AND is_deleted=FALSE', [productid, warehouseid]);
    return result.rows[0] || null;
}

// Sums across every warehouse — a product can hold stock in more than one
// place (see stock_transfers), so the reorder check must look at the total,
// not just the single warehouse row the caller happens to be mutating.
async function getTotalStock(productid) {
    const r = await pool.query('SELECT COALESCE(SUM(quantity),0) AS total FROM stocks WHERE productid=$1 AND is_deleted=FALSE', [productid]);
    return parseFloat(r.rows[0].total);
}

// Fires the low-stock email only on the crossing (was >= reorder_level, now below it),
// so a product that's already below its reorder level doesn't re-trigger an email
// on every subsequent movement.
async function checkLowStock(productid, beforeTotal, afterTotal) {
    try {
        const prod = await pool.query('SELECT pname, pcode, reorder_level FROM products WHERE id=$1 AND is_deleted=FALSE', [productid]);
        if (!prod.rows.length) return;
        const { pname, pcode, reorder_level } = prod.rows[0];
        if (!reorder_level || reorder_level <= 0) return;
        if (beforeTotal >= reorder_level && afterTotal < reorder_level) {
            await lowStockAlert.notifyLowStock({ pname, pcode, quantity: afterTotal, reorder_level });
        }
    } catch (err) {
        console.error('checkLowStock error:', err);
    }
}

async function recordMovement(productid, warehouseid, change, reason, refType, refId, userId) {
    await pool.query(
        `INSERT INTO stock_movements(productid, warehouseid, change, reason, ref_type, ref_id, created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [productid, warehouseid, change, reason, refType, refId, userId]
    );
}

// Adds `quantity` to the given product/warehouse's stock row (creating the row
// if this is the first time that product has ever been stocked there).
async function saveStock(productid, quantity, { userId = null, refType = 'order_details', refId = null, warehouseid = 1 } = {}) {
    try {
        const beforeTotal = await getTotalStock(productid);
        const stock = await getStockRow(productid, warehouseid);
        const now = new Date();
        if (stock) {
            await pool.query('UPDATE stocks SET quantity=$1,updatedate=$2 WHERE id=$3',
                [parseFloat(stock.quantity) + parseFloat(quantity), now, stock.id]);
        } else {
            await pool.query('INSERT INTO stocks(quantity,productid,warehouseid,updatedate) VALUES($1,$2,$3,$4)',
                [quantity, productid, warehouseid, now]);
        }
        await recordMovement(productid, warehouseid, parseFloat(quantity), 'order', refType, refId, userId);
        await checkLowStock(productid, beforeTotal, await getTotalStock(productid));
    } catch (err) {
        console.error('saveStock error:', err);
    }
}

// Removes `quantity` from the given product/warehouse's stock row. Availability
// is checked against that warehouse specifically — a product can show plenty of
// stock company-wide while still being unable to fulfil a delivery from warehouse X.
async function decreaseStock(productid, quantity, { userId = null, refType = 'delivery_details', refId = null, warehouseid = 1 } = {}) {
    try {
        const beforeTotal = await getTotalStock(productid);
        const stock = await getStockRow(productid, warehouseid);
        const available = stock ? parseFloat(stock.quantity) : 0;
        if (available < parseFloat(quantity)) {
            throw new Error(`Insufficient stock in the selected warehouse. Only ${available} unit(s) available.`);
        }
        const now = new Date();
        await pool.query('UPDATE stocks SET quantity=$1,updatedate=$2 WHERE id=$3',
            [available - parseFloat(quantity), now, stock.id]);
        await recordMovement(productid, warehouseid, -parseFloat(quantity), 'delivery', refType, refId, userId);
        await checkLowStock(productid, beforeTotal, await getTotalStock(productid));
    } catch (err) {
        console.error('decreaseStock error:', err.message);
        throw err;
    }
}

// Applies an arbitrary +/- change to a product/warehouse's stock row (used for
// manual adjustments and for restocking returns back into their origin warehouse).
// Creates the row on a positive change if one doesn't exist yet; a negative change
// against a nonexistent row is a no-op on `stocks` (nothing to subtract from) but
// still gets its movement recorded for audit purposes.
async function adjustStock(productid, change, { userId = null, reason = 'adjustment', refType = 'stocks', refId = null, warehouseid = 1 } = {}) {
    try {
        const beforeTotal = await getTotalStock(productid);
        const stock = await getStockRow(productid, warehouseid);
        const now = new Date();
        if (stock) {
            await pool.query('UPDATE stocks SET quantity=$1,updatedate=$2 WHERE id=$3',
                [parseFloat(stock.quantity) + parseFloat(change), now, stock.id]);
        } else if (parseFloat(change) > 0) {
            await pool.query('INSERT INTO stocks(quantity,productid,warehouseid,updatedate) VALUES($1,$2,$3,$4)',
                [change, productid, warehouseid, now]);
        }
        await recordMovement(productid, warehouseid, parseFloat(change), reason, refType, refId, userId);
        await checkLowStock(productid, beforeTotal, await getTotalStock(productid));
    } catch (err) {
        console.error('adjustStock error:', err);
    }
}

module.exports = { saveStock, decreaseStock, adjustStock, getTotalStock, checkLowStock };
