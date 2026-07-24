const pool = require('../connection');
const { toCSV, toPDF, toExcel } = require('../utils/reportExport');

const PERIOD_UNITS = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' };
const isoDate = (d) => d.toISOString().slice(0, 10);

// Sensible default windows when the caller doesn't pass from/to, keyed by bucket size —
// a daily report defaulting to a 5-year range would return thousands of useless rows.
const defaultRangeForPeriod = (period) => {
    const to = new Date();
    const from = new Date();
    switch (period) {
        case 'daily':   from.setDate(to.getDate() - 30); break;
        case 'weekly':  from.setDate(to.getDate() - 7 * 12); break;
        case 'yearly':  from.setFullYear(to.getFullYear() - 5); break;
        default:        from.setMonth(to.getMonth() - 12); // monthly
    }
    return { from: isoDate(from), to: isoDate(to) };
};

const resolvePeriodParams = (query) => {
    const period = query.period || 'monthly';
    const unit = PERIOD_UNITS[period];
    if (!unit) throw Object.assign(new Error(`Invalid period. Use one of: ${Object.keys(PERIOD_UNITS).join(', ')}.`), { status: 400 });
    const range = (query.from && query.to) ? { from: query.from, to: query.to } : defaultRangeForPeriod(period);
    return { period, unit, range };
};

// ── Report builders — each returns {title, columns, rows, summary, meta}. ──
// Used both by the JSON endpoints and the export endpoint, so the two never drift.

const buildSalesReport = async (query) => {
    const { period, unit, range } = resolvePeriodParams(query);
    const result = await pool.query(
        `SELECT date_trunc($1, deliverydate) AS bucket, SUM(quantity) AS qty, SUM(total_price) AS revenue
         FROM delivery_details
         WHERE is_deleted = FALSE AND deliverydate BETWEEN $2 AND $3
         GROUP BY bucket ORDER BY bucket`,
        [unit, range.from, range.to]
    );
    const rows = result.rows.map(r => ({ period: isoDate(r.bucket), qty: parseFloat(r.qty), revenue: parseFloat(r.revenue) }));
    const totalQty = rows.reduce((s, r) => s + r.qty, 0);
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    return {
        title: `Sales Report (${period})`,
        columns: [{ key: 'period', label: 'Period' }, { key: 'qty', label: 'Qty Sold' }, { key: 'revenue', label: 'Revenue' }],
        rows,
        summary: [`Range: ${range.from} to ${range.to}`, `Total Qty Sold: ${totalQty}`, `Total Revenue: ${totalRevenue.toFixed(2)}`],
        meta: { period, ...range, totalQty, totalRevenue },
    };
};

const buildPurchaseReport = async (query) => {
    const { period, unit, range } = resolvePeriodParams(query);
    const result = await pool.query(
        `SELECT date_trunc($1, createdate) AS bucket, SUM(quantity) AS qty, SUM(total_price) AS cost
         FROM order_details
         WHERE is_deleted = FALSE AND createdate BETWEEN $2 AND $3
         GROUP BY bucket ORDER BY bucket`,
        [unit, range.from, range.to]
    );
    const rows = result.rows.map(r => ({ period: isoDate(r.bucket), qty: parseFloat(r.qty), cost: parseFloat(r.cost) }));
    const totalQty = rows.reduce((s, r) => s + r.qty, 0);
    const totalCost = rows.reduce((s, r) => s + r.cost, 0);
    return {
        title: `Purchase Report (${period})`,
        columns: [{ key: 'period', label: 'Period' }, { key: 'qty', label: 'Qty Purchased' }, { key: 'cost', label: 'Cost' }],
        rows,
        summary: [`Range: ${range.from} to ${range.to}`, `Total Qty Purchased: ${totalQty}`, `Total Cost: ${totalCost.toFixed(2)}`],
        meta: { period, ...range, totalQty, totalCost },
    };
};

const buildStockValuation = async () => {
    const result = await pool.query(
        `SELECT p.pcode, p.pname, COALESCE(SUM(s.quantity), 0) AS qty, p.price AS unit_cost,
                COALESCE(SUM(s.quantity), 0) * p.price AS valuation
         FROM products p
         LEFT JOIN stocks s ON s.productid = p.id AND s.is_deleted = FALSE
         WHERE p.is_deleted = FALSE
         GROUP BY p.id, p.pcode, p.pname, p.price
         ORDER BY valuation DESC`
    );
    const rows = result.rows.map(r => ({
        pcode: r.pcode, pname: r.pname, qty: parseFloat(r.qty),
        unit_cost: parseFloat(r.unit_cost || 0), valuation: parseFloat(r.valuation || 0),
    }));
    const totalValuation = rows.reduce((s, r) => s + r.valuation, 0);
    return {
        title: 'Stock Valuation Report',
        columns: [
            { key: 'pcode', label: 'Code' }, { key: 'pname', label: 'Product' }, { key: 'qty', label: 'Qty' },
            { key: 'unit_cost', label: 'Unit Cost' }, { key: 'valuation', label: 'Valuation' },
        ],
        rows,
        summary: [`Total Valuation: ${totalValuation.toFixed(2)}`],
        meta: { totalValuation },
    };
};

// Sales = delivery_details.total_price, Purchases = order_details.total_price, Tax = invoices.tax_amount.
// This is a simplified P&L, not true COGS-matched accounting: purchases reflect the full PO
// cost for the period (not just the cost of units actually sold), and tax is only what's been
// invoiced in that window. Good enough for a directional view; flag if exact accounting is needed.
const buildProfitLoss = async (query) => {
    const { period, unit, range } = resolvePeriodParams(query);

    const [salesRes, purchaseRes, taxRes] = await Promise.all([
        pool.query(`SELECT date_trunc($1, deliverydate) AS bucket, SUM(total_price) AS sales
                    FROM delivery_details WHERE is_deleted = FALSE AND deliverydate BETWEEN $2 AND $3 GROUP BY bucket`,
                    [unit, range.from, range.to]),
        pool.query(`SELECT date_trunc($1, createdate) AS bucket, SUM(total_price) AS purchases
                    FROM order_details WHERE is_deleted = FALSE AND createdate BETWEEN $2 AND $3 GROUP BY bucket`,
                    [unit, range.from, range.to]),
        pool.query(`SELECT date_trunc($1, issue_date) AS bucket, SUM(tax_amount) AS tax
                    FROM invoices WHERE is_deleted = FALSE AND issue_date BETWEEN $2 AND $3 GROUP BY bucket`,
                    [unit, range.from, range.to]),
    ]);

    const map = new Map();
    const merge = (bucket, field, value) => {
        const k = isoDate(bucket);
        map.set(k, { ...(map.get(k) || {}), [field]: value });
    };
    salesRes.rows.forEach(r => merge(r.bucket, 'sales', parseFloat(r.sales)));
    purchaseRes.rows.forEach(r => merge(r.bucket, 'purchases', parseFloat(r.purchases)));
    taxRes.rows.forEach(r => merge(r.bucket, 'tax', parseFloat(r.tax)));

    const rows = Array.from(map.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([bucket, v]) => {
            const sales = v.sales || 0, purchases = v.purchases || 0, tax = v.tax || 0;
            return { period: bucket, sales, purchases, tax, profit: sales - purchases - tax };
        });

    const totals = rows.reduce((acc, r) => ({
        sales: acc.sales + r.sales, purchases: acc.purchases + r.purchases,
        tax: acc.tax + r.tax, profit: acc.profit + r.profit,
    }), { sales: 0, purchases: 0, tax: 0, profit: 0 });

    return {
        title: `Profit & Loss (${period})`,
        columns: [
            { key: 'period', label: 'Period' }, { key: 'sales', label: 'Sales' }, { key: 'purchases', label: 'Purchases' },
            { key: 'tax', label: 'Tax' }, { key: 'profit', label: 'Profit / Loss' },
        ],
        rows,
        summary: [
            `Range: ${range.from} to ${range.to}`,
            `Total Sales: ${totals.sales.toFixed(2)}`,
            `Total Purchases: ${totals.purchases.toFixed(2)}`,
            `Total Tax: ${totals.tax.toFixed(2)}`,
            `Net Profit/Loss: ${totals.profit.toFixed(2)}`,
        ],
        meta: { period, ...range, totals },
    };
};

const buildTopSelling = async (query) => {
    const range = (query.from && query.to)
        ? { from: query.from, to: query.to }
        : (() => { const to = new Date(); const from = new Date(); from.setDate(to.getDate() - 90); return { from: isoDate(from), to: isoDate(to) }; })();
    const limit = Math.min(parseInt(query.limit) || 10, 100);

    const result = await pool.query(
        `SELECT p.pcode, p.pname, SUM(d.quantity) AS qty_sold, SUM(d.total_price) AS revenue
         FROM delivery_details d JOIN products p ON p.id = d.productid
         WHERE d.is_deleted = FALSE AND d.deliverydate BETWEEN $1 AND $2
         GROUP BY p.id, p.pcode, p.pname
         ORDER BY qty_sold DESC
         LIMIT $3`,
        [range.from, range.to, limit]
    );
    const rows = result.rows.map(r => ({ pcode: r.pcode, pname: r.pname, qty_sold: parseFloat(r.qty_sold), revenue: parseFloat(r.revenue) }));
    return {
        title: 'Top Selling Products',
        columns: [{ key: 'pcode', label: 'Code' }, { key: 'pname', label: 'Product' }, { key: 'qty_sold', label: 'Qty Sold' }, { key: 'revenue', label: 'Revenue' }],
        rows,
        summary: [`Range: ${range.from} to ${range.to}`, `Top ${rows.length} product(s)`],
        meta: { ...range, limit },
    };
};

const buildDeadStock = async (query) => {
    const days = Math.max(parseInt(query.days) || 90, 1);
    const result = await pool.query(
        `SELECT p.pcode, p.pname, COALESCE(SUM(s.quantity), 0) AS stock_quantity, MAX(d.deliverydate) AS last_sold
         FROM products p
         LEFT JOIN stocks s ON s.productid = p.id AND s.is_deleted = FALSE
         LEFT JOIN delivery_details d ON d.productid = p.id AND d.is_deleted = FALSE
         WHERE p.is_deleted = FALSE
         GROUP BY p.id, p.pcode, p.pname
         HAVING COALESCE(SUM(s.quantity), 0) > 0
            AND (MAX(d.deliverydate) IS NULL OR MAX(d.deliverydate) < CURRENT_DATE - ($1::INT * INTERVAL '1 day'))
         ORDER BY stock_quantity DESC`,
        [days]
    );
    const rows = result.rows.map(r => ({
        pcode: r.pcode, pname: r.pname, stock_quantity: parseFloat(r.stock_quantity),
        last_sold: r.last_sold ? isoDate(r.last_sold) : 'Never',
    }));
    return {
        title: `Dead Stock Report (no sales in ${days} days)`,
        columns: [{ key: 'pcode', label: 'Code' }, { key: 'pname', label: 'Product' }, { key: 'stock_quantity', label: 'Stock Qty' }, { key: 'last_sold', label: 'Last Sold' }],
        rows,
        summary: [`Threshold: ${days} days`, `${rows.length} product(s) flagged as dead stock`],
        meta: { days },
    };
};

const BUILDERS = {
    sales: buildSalesReport,
    purchases: buildPurchaseReport,
    'stock-valuation': buildStockValuation,
    'profit-loss': buildProfitLoss,
    'top-selling': buildTopSelling,
    'dead-stock': buildDeadStock,
};

// ── HTTP handlers ──────────────────────────────────────────────────
const makeHandler = (builder) => async (req, res) => {
    try { res.status(200).json(await builder(req.query)); }
    catch (err) { res.status(err.status || 500).json({ message: err.message }); }
};

const salesReport = makeHandler(buildSalesReport);
const purchaseReport = makeHandler(buildPurchaseReport);
const stockValuationReport = makeHandler(buildStockValuation);
const profitLossReport = makeHandler(buildProfitLoss);
const topSellingReport = makeHandler(buildTopSelling);
const deadStockReport = makeHandler(buildDeadStock);

const exportReport = async (req, res) => {
    const { type, format = 'csv' } = req.query;
    const builder = BUILDERS[type];
    if (!builder) return res.status(400).json({ message: `Invalid report type. Use one of: ${Object.keys(BUILDERS).join(', ')}.` });

    try {
        const report = await builder(req.query);
        const filenameBase = `${type}-report-${isoDate(new Date())}`;

        if (format === 'pdf') {
            const buf = await toPDF(report);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
            return res.send(buf);
        }
        if (format === 'xlsx') {
            const buf = await toExcel(report);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
            return res.send(buf);
        }
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
            return res.send(toCSV(report.columns, report.rows));
        }
        return res.status(400).json({ message: 'Invalid format. Use pdf, xlsx, or csv.' });
    } catch (err) { res.status(err.status || 500).json({ message: err.message }); }
};

module.exports = {
    salesReport, purchaseReport, stockValuationReport, profitLossReport,
    topSellingReport, deadStockReport, exportReport,
};
