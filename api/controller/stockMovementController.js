const pool = require('../connection');
const { getPagination, paginate } = require('../utils/pagination');

const findByProductId = async (req, res) => {
    const { productid } = req.params;
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query(
                `SELECT sm.*, p.pname, p.pcode, w.wname, u.full_name AS created_by_name
                 FROM stock_movements sm
                 LEFT JOIN products   p ON p.id = sm.productid
                 LEFT JOIN warehouses w ON w.id = sm.warehouseid
                 LEFT JOIN users      u ON u.id = sm.created_by
                 WHERE sm.productid = $1
                 ORDER BY sm.createdate DESC
                 LIMIT $2 OFFSET $3`,
                [productid, limit, offset]
            ),
            pool.query('SELECT COUNT(*) FROM stock_movements WHERE productid=$1', [productid])
        ]);
        res.json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const { productid, reason } = req.query;
    const conditions = ['1=1'];
    const params = [];
    if (productid) { params.push(productid); conditions.push(`sm.productid = $${params.length}`); }
    if (reason)    { params.push(reason);    conditions.push(`sm.reason = $${params.length}`); }
    const where = conditions.join(' AND ');
    params.push(limit); params.push(offset);
    try {
        const [data, count] = await Promise.all([
            pool.query(
                `SELECT sm.*, p.pname, p.pcode, w.wname, u.full_name AS created_by_name
                 FROM stock_movements sm
                 LEFT JOIN products   p ON p.id = sm.productid
                 LEFT JOIN warehouses w ON w.id = sm.warehouseid
                 LEFT JOIN users      u ON u.id = sm.created_by
                 WHERE ${where}
                 ORDER BY sm.createdate DESC
                 LIMIT $${params.length - 1} OFFSET $${params.length}`,
                params
            ),
            pool.query(
                `SELECT COUNT(*) FROM stock_movements sm WHERE ${where}`,
                params.slice(0, params.length - 2)
            )
        ]);
        res.json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { findByProductId, findAll };
