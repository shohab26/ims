const pool = require('../connection');

const isoMonth = (d) => d.toISOString().slice(0, 7); // YYYY-MM

// ── Revenue chart (last N months, default 12) ──────────────────────
// Revenue is sourced from delivery_details.total_price — the same "sales"
// definition used by the Reports module's Sales Report, so the dashboard
// chart and the Reports drill-down never disagree on what "revenue" means.
const revenueChart = async (req, res) => {
    const months = Math.min(Math.max(parseInt(req.query.months) || 12, 1), 36);
    try {
        const result = await pool.query(
            `SELECT date_trunc('month', deliverydate) AS bucket, SUM(total_price) AS revenue
             FROM delivery_details
             WHERE is_deleted = FALSE AND deliverydate >= (CURRENT_DATE - ($1::TEXT || ' months')::INTERVAL)
             GROUP BY bucket ORDER BY bucket`,
            [months]
        );
        const byMonth = new Map(result.rows.map(r => [isoMonth(r.bucket), parseFloat(r.revenue)]));

        // Fill in every month in the window (including zero-revenue months) so the
        // chart doesn't silently skip gaps.
        const labels = [];
        const data = [];
        const cursor = new Date();
        cursor.setDate(1);
        const points = [];
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
            points.push(d);
        }
        points.forEach(d => {
            const key = isoMonth(d);
            labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
            data.push(byMonth.get(key) || 0);
        });

        res.status(200).json({ labels, data });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Inventory value widget ──────────────────────────────────────────
const inventoryValue = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COALESCE(SUM(s.quantity * p.price), 0) AS total_value,
                    COUNT(DISTINCT p.id) AS total_products,
                    COALESCE(SUM(s.quantity), 0) AS total_qty
             FROM products p
             LEFT JOIN stocks s ON s.productid = p.id AND s.is_deleted = FALSE
             WHERE p.is_deleted = FALSE`
        );
        const row = result.rows[0];
        res.status(200).json({
            totalValue: parseFloat(row.total_value),
            totalProducts: parseInt(row.total_products),
            totalQty: parseFloat(row.total_qty),
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Pending purchase orders count ───────────────────────────────────
// "Pending" = not yet fully received and not cancelled (draft/sent/partial).
const pendingOrdersCount = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) FROM order_details WHERE is_deleted = FALSE AND po_status IN ('draft','sent','partial')`
        );
        res.status(200).json({ count: parseInt(result.rows[0].count) });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Overdue invoices widget ──────────────────────────────────────────
// Overdue = due_date has passed AND there's still a genuine amount owing,
// regardless of what the status label says (keeps this correct even if a
// status edit and a payment ever drift out of sync).
const overdueInvoices = async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 5, 50);
    try {
        const result = await pool.query(
            `SELECT i.id, i.invoice_number, c.customer_name, i.due_date, i.total,
                    COALESCE(pay.paid_amount, 0) AS paid_amount,
                    i.total - COALESCE(pay.paid_amount, 0) AS due_amount
             FROM invoices i
             JOIN customers c ON c.id = i.customerid
             LEFT JOIN (
                 SELECT invoice_id, SUM(amount) AS paid_amount FROM payments WHERE is_deleted = FALSE GROUP BY invoice_id
             ) pay ON pay.invoice_id = i.id
             WHERE i.is_deleted = FALSE AND i.status <> 'cancelled' AND i.due_date < CURRENT_DATE
               AND i.total - COALESCE(pay.paid_amount, 0) > 0
             ORDER BY i.due_date ASC`
        );
        const rows = result.rows.map(r => ({
            id: r.id, invoice_number: r.invoice_number, customer_name: r.customer_name,
            due_date: r.due_date, total: parseFloat(r.total),
            paid_amount: parseFloat(r.paid_amount), due_amount: parseFloat(r.due_amount),
        }));
        const count = rows.length;
        const totalDue = rows.reduce((s, r) => s + r.due_amount, 0);
        res.status(200).json({ count, totalDue, invoices: rows.slice(0, limit) });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Top 5 customers (by revenue, last 12 months) ────────────────────
const topCustomers = async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 5, 50);
    const months = Math.min(Math.max(parseInt(req.query.months) || 12, 1), 36);
    try {
        const result = await pool.query(
            `SELECT c.id AS customerid, c.customer_name, SUM(d.total_price) AS revenue, COUNT(*) AS order_count
             FROM delivery_details d
             JOIN customers c ON c.id = d.customerid
             WHERE d.is_deleted = FALSE AND d.deliverydate >= (CURRENT_DATE - ($2::TEXT || ' months')::INTERVAL)
             GROUP BY c.id, c.customer_name
             ORDER BY revenue DESC
             LIMIT $1`,
            [limit, months]
        );
        const rows = result.rows.map(r => ({
            customerid: r.customerid, customer_name: r.customer_name,
            revenue: parseFloat(r.revenue), order_count: parseInt(r.order_count),
        }));
        res.status(200).json(rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Top 5 products (by qty sold, last 12 months) ─────────────────────
const topProducts = async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 5, 50);
    const months = Math.min(Math.max(parseInt(req.query.months) || 12, 1), 36);
    try {
        const result = await pool.query(
            `SELECT p.id, p.pcode, p.pname, SUM(d.quantity) AS qty_sold, SUM(d.total_price) AS revenue
             FROM delivery_details d
             JOIN products p ON p.id = d.productid
             WHERE d.is_deleted = FALSE AND d.deliverydate >= (CURRENT_DATE - ($2::TEXT || ' months')::INTERVAL)
             GROUP BY p.id, p.pcode, p.pname
             ORDER BY qty_sold DESC
             LIMIT $1`,
            [limit, months]
        );
        const rows = result.rows.map(r => ({
            id: r.id, pcode: r.pcode, pname: r.pname,
            qty_sold: parseFloat(r.qty_sold), revenue: parseFloat(r.revenue),
        }));
        res.status(200).json(rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { revenueChart, inventoryValue, pendingOrdersCount, overdueInvoices, topCustomers, topProducts };
