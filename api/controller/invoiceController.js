const pool = require('../connection');
const PDFDocument = require('pdfkit');
const { getPagination, paginate } = require('../utils/pagination');
const emailService = require('../services/emailService');

// ── helpers ─────────────────────────────────────────────────────

const itemsOf = async (invoiceid) => {
    const r = await pool.query(
        `SELECT ii.*, p.pname, p.pcode FROM invoice_items ii
         JOIN products p ON p.id = ii.productid
         WHERE ii.invoiceid = $1 ORDER BY ii.id`, [invoiceid]);
    return r.rows;
};

const paymentsOf = async (invoiceid) => {
    const r = await pool.query(
        `SELECT p.*, u.full_name AS created_by_name FROM payments p
         LEFT JOIN users u ON u.id = p.created_by
         WHERE p.invoice_id = $1 AND p.is_deleted = FALSE ORDER BY p.paid_at DESC, p.id DESC`, [invoiceid]);
    return r.rows;
};

// Recomputes paid total for an invoice and flips status to 'paid' once
// payments cover the total. Never overrides a 'cancelled' invoice, and
// steps a fully-paid invoice back to 'sent' if a payment is later voided.
const syncInvoiceStatus = async (client, invoiceid) => {
    const inv = await client.query('SELECT total, status FROM invoices WHERE id=$1', [invoiceid]);
    if (!inv.rows.length) return;
    const { total, status } = inv.rows[0];
    if (status === 'cancelled') return;

    const paidRes = await client.query(
        `SELECT COALESCE(SUM(amount),0) AS paid FROM payments WHERE invoice_id=$1 AND is_deleted=FALSE`, [invoiceid]);
    const paid = parseFloat(paidRes.rows[0].paid);

    if (paid >= parseFloat(total) && status !== 'paid') {
        await client.query('UPDATE invoices SET status=$1 WHERE id=$2', ['paid', invoiceid]);
    } else if (paid < parseFloat(total) && status === 'paid') {
        await client.query('UPDATE invoices SET status=$1 WHERE id=$2', ['sent', invoiceid]);
    }
};

// ── CRUD ─────────────────────────────────────────────────────────
const findAll = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query(`SELECT i.*, c.customer_name, u1.full_name AS created_by_name, u2.full_name AS updated_by_name,
                                COALESCE(p.paid_amount, 0) AS paid_amount,
                                i.total - COALESCE(p.paid_amount, 0) AS due_amount
                        FROM invoices i
                        JOIN customers c ON c.id = i.customerid
                        LEFT JOIN users u1 ON u1.id = i.created_by
                        LEFT JOIN users u2 ON u2.id = i.updated_by
                        LEFT JOIN (
                            SELECT invoice_id, SUM(amount) AS paid_amount
                            FROM payments WHERE is_deleted = FALSE GROUP BY invoice_id
                        ) p ON p.invoice_id = i.id
                        WHERE i.is_deleted = FALSE
                        ORDER BY i.id DESC LIMIT $1 OFFSET $2`, [limit, offset]),
            pool.query('SELECT COUNT(*) FROM invoices WHERE is_deleted = FALSE')
        ]);
        res.json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findByKeyword = async (req, res) => {
    const value = req.query.value;
    const { page, limit, offset } = getPagination(req.query);
    if (!value) return findAll(req, res);
    try {
        const like = `%${value}%`;
        const [data, count] = await Promise.all([
            pool.query(`SELECT i.*, c.customer_name FROM invoices i
                        JOIN customers c ON c.id = i.customerid
                        WHERE i.is_deleted = FALSE
                          AND (i.invoice_number ILIKE $1 OR c.customer_name ILIKE $1 OR i.status ILIKE $1)
                        ORDER BY i.id DESC LIMIT $2 OFFSET $3`, [like, limit, offset]),
            pool.query(`SELECT COUNT(*) FROM invoices i JOIN customers c ON c.id = i.customerid
                        WHERE i.is_deleted = FALSE
                          AND (i.invoice_number ILIKE $1 OR c.customer_name ILIKE $1 OR i.status ILIKE $1)`, [like])
        ]);
        res.json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findDeleted = async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    try {
        const [data, count] = await Promise.all([
            pool.query(`SELECT i.*, c.customer_name FROM invoices i
                        JOIN customers c ON c.id = i.customerid
                        WHERE i.is_deleted = TRUE
                        ORDER BY i.deleted_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
            pool.query('SELECT COUNT(*) FROM invoices WHERE is_deleted = TRUE')
        ]);
        res.json(paginate(data.rows, parseInt(count.rows[0].count), page, limit));
    } catch (err) { res.status(500).json(err); }
};

const findById = async (req, res) => {
    try {
        const inv = await pool.query(
            `SELECT i.*, c.customer_name, c.email, c.phone, c.address
             FROM invoices i JOIN customers c ON c.id = i.customerid
             WHERE i.id = $1`, [req.params.id]);
        if (!inv.rows.length) return res.status(404).json({ message: 'Not found.' });
        const items = await itemsOf(req.params.id);
        const payments = await paymentsOf(req.params.id);
        const paid_amount = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
        const due_amount = parseFloat(inv.rows[0].total) - paid_amount;
        res.json({ ...inv.rows[0], items, payments, paid_amount, due_amount });
    } catch (err) { res.status(500).json(err); }
};

const save = async (req, res) => {
    const { customerid, due_date, discount = 0, tax_percent = 0, notes, items = [] } = req.body;

    // Check stock availability for each line item before opening a transaction
    for (const item of items) {
        const s = await pool.query(
            'SELECT quantity FROM stocks WHERE productid=$1 AND is_deleted=FALSE', [item.productid]);
        const available = s.rows.length ? parseFloat(s.rows[0].quantity) : 0;
        if (available < parseFloat(item.quantity)) {
            const prod = await pool.query('SELECT pcode FROM products WHERE id=$1', [item.productid]);
            const code = prod.rows[0]?.pcode || `Product #${item.productid}`;
            return res.status(400).json({
                message: `Insufficient stock for ${code}. Only ${available} unit(s) available.`
            });
        }
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const seqRes = await client.query(
            `SELECT next_invoice_number(EXTRACT(YEAR FROM NOW())::INTEGER) AS num`);
        const invoice_number = seqRes.rows[0].num;
        const subtotal = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);
        const tax_amount = subtotal * (tax_percent / 100);
        const total = subtotal - discount + tax_amount;

        const inv = await client.query(
            `INSERT INTO invoices(invoice_number,customerid,due_date,subtotal,discount,tax_percent,tax_amount,total,notes,created_by)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
            [invoice_number, customerid, due_date || null, subtotal, discount, tax_percent, tax_amount, total, notes, req.user.id]);
        const invoiceid = inv.rows[0].id;

        for (const item of items) {
            const lineTotal = item.quantity * item.unit_price;
            await client.query(
                `INSERT INTO invoice_items(invoiceid,productid,description,quantity,unit_price,total)
                 VALUES($1,$2,$3,$4,$5,$6)`,
                [invoiceid, item.productid, item.description || '', item.quantity, item.unit_price, lineTotal]);
        }
        await client.query('COMMIT');
        res.status(201).json({ message: 'Invoice created.', invoice_number });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json(err); }
    finally { client.release(); }
};

const updateById = async (req, res) => {
    const { customerid, due_date, discount = 0, tax_percent = 0, notes, status, items = [] } = req.body;

    for (const item of items) {
        const s = await pool.query(
            'SELECT quantity FROM stocks WHERE productid=$1 AND is_deleted=FALSE', [item.productid]);
        const available = s.rows.length ? parseFloat(s.rows[0].quantity) : 0;
        if (available < parseFloat(item.quantity)) {
            const prod = await pool.query('SELECT pcode FROM products WHERE id=$1', [item.productid]);
            const code = prod.rows[0]?.pcode || `Product #${item.productid}`;
            return res.status(400).json({
                message: `Insufficient stock for ${code}. Only ${available} unit(s) available.`
            });
        }
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const subtotal = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);
        const tax_amount = subtotal * (tax_percent / 100);
        const total = subtotal - discount + tax_amount;

        const r = await client.query(
            `UPDATE invoices SET customerid=$1,due_date=$2,subtotal=$3,discount=$4,tax_percent=$5,
             tax_amount=$6,total=$7,notes=$8,status=COALESCE($9,status),updated_by=$10 WHERE id=$11`,
            [customerid, due_date || null, subtotal, discount, tax_percent, tax_amount, total, notes, status, req.user.id, req.params.id]);
        if (!r.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Not found.' }); }

        await client.query('DELETE FROM invoice_items WHERE invoiceid=$1', [req.params.id]);
        // NOTE: The DELETE above is INTENTIONAL and remains a hard delete.
        // It is not a user-initiated trash — it is the transactional wipe that
        // precedes a fresh INSERT of the new line items in an invoice edit.
        // Do not convert this to a soft delete.
        for (const item of items) {
            await client.query(
                `INSERT INTO invoice_items(invoiceid,productid,description,quantity,unit_price,total)
                 VALUES($1,$2,$3,$4,$5,$6)`,
                [req.params.id, item.productid, item.description || '', item.quantity, item.unit_price, item.quantity * item.unit_price]);
        }
        await client.query('COMMIT');
        res.json({ message: 'Invoice updated.' });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json(err); }
    finally { client.release(); }
};

const deleteById = async (req, res) => {
    // Soft-delete the parent invoice and ALL its line items in one transaction.
    // The line items follow the parent — without this, itemsOf() for a trashed
    // invoice would return empty items, which would break the trash preview.
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE invoice_items SET is_deleted=TRUE, deleted_at=NOW(), deleted_by=$2
             WHERE invoiceid=$1 AND is_deleted=FALSE`,
            [req.params.id, req.user.id]
        );
        const r = await client.query(
            `UPDATE invoices SET is_deleted=TRUE, deleted_at=NOW(), deleted_by=$2
             WHERE id=$1 AND is_deleted=FALSE`,
            [req.params.id, req.user.id]
        );
        if (!r.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Not found.' }); }
        await client.query('COMMIT');
        res.json({ message: 'Invoice deleted.' });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json(err); }
    finally { client.release(); }
};

const restoreById = async (req, res) => {
    // Mirror image of deleteById: bring back parent + all line items in one TX.
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE invoice_items SET is_deleted=FALSE, deleted_at=NULL, deleted_by=NULL
             WHERE invoiceid=$1 AND is_deleted=TRUE`,
            [req.params.id]
        );
        const r = await client.query(
            `UPDATE invoices SET is_deleted=FALSE, deleted_at=NULL, deleted_by=NULL
             WHERE id=$1 AND is_deleted=TRUE`,
            [req.params.id]
        );
        if (!r.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Not found or not deleted.' }); }
        await client.query('COMMIT');
        res.json({ message: 'Invoice restored.' });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json(err); }
    finally { client.release(); }
};

// ── PDF builder (shared by download and email) ───────────────────
const buildPDFBuffer = (invoice, items) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

        // ── Brand header ────────────────────────────────────────
        doc.rect(0, 0, doc.page.width, 90).fill('#1a1a2e');
        doc.fillColor('#fff').fontSize(26).font('Helvetica-Bold')
            .text('InvenTrack', 50, 28);
        doc.fontSize(10).font('Helvetica')
            .text('Inventory Management System', 50, 58);
        doc.fillColor('#94a3b8').fontSize(9)
            .text('www.inventrack.com  |  support@inventrack.com', 50, 72);

        // ── INVOICE label + number ────────────────────────────
        doc.fillColor('#1a1a2e').fontSize(22).font('Helvetica-Bold')
            .text('INVOICE', 380, 28, { align: 'right' });
        doc.fillColor('#6366f1').fontSize(11).font('Helvetica')
            .text(invoice.invoice_number, 380, 56, { align: 'right' });

        // ── Bill To + Dates ──────────────────────────────────
        const infoY = 110;
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold')
            .text('BILL TO', 50, infoY);
        doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold')
            .text(invoice.customer_name, 50, infoY + 14);
        doc.fillColor('#6b7280').fontSize(9).font('Helvetica')
            .text(invoice.address || '', 50, infoY + 28)
            .text(invoice.phone || '', 50, infoY + 40)
            .text(invoice.email || '', 50, infoY + 52);

        const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold')
            .text('INVOICE DATE', 380, infoY, { align: 'right' });
        doc.fillColor('#111827').fontSize(9).font('Helvetica')
            .text(fmt(invoice.issue_date), 380, infoY + 12, { align: 'right' });
        doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold')
            .text('DUE DATE', 380, infoY + 30, { align: 'right' });
        doc.fillColor('#111827').fontSize(9).font('Helvetica')
            .text(fmt(invoice.due_date), 380, infoY + 42, { align: 'right' });

        const badge = { draft:'#6b7280', sent:'#3b82f6', paid:'#22c55e', overdue:'#ef4444', cancelled:'#9ca3af' };
        const col = badge[invoice.status] || '#6b7280';
        doc.roundedRect(430, infoY + 60, 100, 18, 4).fill(col);
        doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold')
            .text(invoice.status.toUpperCase(), 430, infoY + 64, { width: 100, align: 'center' });

        // ── Table header ─────────────────────────────────────
        const tableY = infoY + 90;
        doc.rect(50, tableY, doc.page.width - 100, 22).fill('#1a1a2e');
        doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold');
        doc.text('#',     55, tableY + 7);
        doc.text('Product / Description', 75, tableY + 7);
        doc.text('Qty',  340, tableY + 7, { width: 50, align: 'right' });
        doc.text('Rate', 395, tableY + 7, { width: 60, align: 'right' });
        doc.text('Amount', 455, tableY + 7, { width: 90, align: 'right' });

        // ── Table rows ───────────────────────────────────────
        let rowY = tableY + 26;
        items.forEach((item, i) => {
            const bg = i % 2 === 0 ? '#f8fafc' : '#fff';
            doc.rect(50, rowY - 4, doc.page.width - 100, 22).fill(bg);
            doc.fillColor('#111827').fontSize(9).font('Helvetica');
            doc.text(String(i + 1), 55, rowY);
            doc.text(`${item.pname || ''} ${item.description ? '— ' + item.description : ''}`.trim(), 75, rowY, { width: 260 });
            doc.text(String(item.quantity), 340, rowY, { width: 50, align: 'right' });
            doc.text(`$${parseFloat(item.unit_price).toFixed(2)}`, 395, rowY, { width: 60, align: 'right' });
            doc.text(`$${parseFloat(item.total).toFixed(2)}`, 455, rowY, { width: 90, align: 'right' });
            rowY += 22;
        });

        // ── Divider ──────────────────────────────────────────
        rowY += 8;
        doc.moveTo(50, rowY).lineTo(doc.page.width - 50, rowY).strokeColor('#e5e7eb').lineWidth(1).stroke();
        rowY += 14;

        // ── Totals ───────────────────────────────────────────
        const addLine = (label, value, bold = false) => {
            doc.fillColor('#6b7280').fontSize(9).font(bold ? 'Helvetica-Bold' : 'Helvetica')
                .text(label, 340, rowY, { width: 110, align: 'right' });
            doc.fillColor(bold ? '#1a1a2e' : '#374151').fontSize(9).font(bold ? 'Helvetica-Bold' : 'Helvetica')
                .text(value, 455, rowY, { width: 90, align: 'right' });
            rowY += 16;
        };
        addLine('Subtotal', `$${parseFloat(invoice.subtotal).toFixed(2)}`);
        addLine(`Discount`, `-$${parseFloat(invoice.discount).toFixed(2)}`);
        addLine(`Tax (${invoice.tax_percent}%)`, `$${parseFloat(invoice.tax_amount).toFixed(2)}`);
        rowY += 4;
        doc.rect(340, rowY - 2, 205, 24).fill('#1a1a2e');
        doc.fillColor('#fff').fontSize(11).font('Helvetica-Bold')
            .text('TOTAL', 345, rowY + 4, { width: 110, align: 'right' });
        doc.fillColor('#fff').fontSize(11).font('Helvetica-Bold')
            .text(`$${parseFloat(invoice.total).toFixed(2)}`, 455, rowY + 4, { width: 85, align: 'right' });
        rowY += 36;

        // ── Notes ────────────────────────────────────────────
        if (invoice.notes) {
            doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold').text('NOTES', 50, rowY);
            doc.fillColor('#374151').fontSize(9).font('Helvetica').text(invoice.notes, 50, rowY + 12, { width: 400 });
            rowY += 40;
        }

        // ── Footer ───────────────────────────────────────────
        doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill('#1a1a2e');
        doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
            .text('Thank you for your business! — InvenTrack', 0, doc.page.height - 26, { align: 'center' });

    doc.end();
});

// ── PDF Download ─────────────────────────────────────────────────
const downloadPDF = async (req, res) => {
    try {
        const inv = await pool.query(
            `SELECT i.*, c.customer_name, c.email, c.phone, c.address
             FROM invoices i JOIN customers c ON c.id = i.customerid WHERE i.id = $1`, [req.params.id]);
        if (!inv.rows.length) return res.status(404).json({ message: 'Not found.' });
        const buf = await buildPDFBuffer(inv.rows[0], await itemsOf(req.params.id));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${inv.rows[0].invoice_number}.pdf"`);
        res.send(buf);
    } catch (err) { res.status(500).json(err); }
};

// ── Email Invoice ─────────────────────────────────────────────────
const emailInvoice = async (req, res) => {
    try {
        const inv = await pool.query(
            `SELECT i.*, c.customer_name, c.email, c.phone, c.address
             FROM invoices i JOIN customers c ON c.id = i.customerid WHERE i.id = $1`, [req.params.id]);
        if (!inv.rows.length) return res.status(404).json({ message: 'Invoice not found.' });
        const invoice = inv.rows[0];
        if (!invoice.email) return res.status(400).json({ message: 'Customer has no email address on file.' });

        const pdfBuffer = await buildPDFBuffer(invoice, await itemsOf(req.params.id));
        await emailService.sendInvoiceEmail({
            to: invoice.email,
            customerName: invoice.customer_name,
            invoiceNumber: invoice.invoice_number,
            total: invoice.total,
            dueDate: invoice.due_date,
            pdfBuffer,
        });
        res.json({ message: `Invoice ${invoice.invoice_number} sent to ${invoice.email}.` });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to send email.' });
    }
};

// ── Payments ──────────────────────────────────────────────────────
const findPayments = async (req, res) => {
    try {
        const inv = await pool.query('SELECT id FROM invoices WHERE id=$1 AND is_deleted=FALSE', [req.params.id]);
        if (!inv.rows.length) return res.status(404).json({ message: 'Invoice not found.' });
        res.json(await paymentsOf(req.params.id));
    } catch (err) { res.status(500).json(err); }
};

const addPayment = async (req, res) => {
    const { amount, method, transaction_id, paid_at, note } = req.body;
    if (!amount || parseFloat(amount) <= 0) return res.status(400).json({ message: 'Amount must be greater than zero.' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const inv = await client.query('SELECT id FROM invoices WHERE id=$1 AND is_deleted=FALSE', [req.params.id]);
        if (!inv.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Invoice not found.' }); }

        const result = await client.query(
            `INSERT INTO payments(invoice_id,amount,method,transaction_id,paid_at,note,created_by)
             VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
            [req.params.id, amount, method || null, transaction_id || null, paid_at || new Date(), note || null, req.user.id]);

        await syncInvoiceStatus(client, req.params.id);
        await client.query('COMMIT');
        res.status(201).json({ message: 'Payment recorded.', id: result.rows[0].id });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json(err); }
    finally { client.release(); }
};

const voidPayment = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const pay = await client.query('SELECT invoice_id FROM payments WHERE id=$1 AND is_deleted=FALSE', [req.params.paymentId]);
        if (!pay.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Payment not found.' }); }

        await client.query(
            'UPDATE payments SET is_deleted=TRUE, deleted_at=NOW(), deleted_by=$2 WHERE id=$1',
            [req.params.paymentId, req.user.id]);

        await syncInvoiceStatus(client, pay.rows[0].invoice_id);
        await client.query('COMMIT');
        res.json({ message: 'Payment voided.' });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json(err); }
    finally { client.release(); }
};

module.exports = { findAll, findByKeyword, findById, save, updateById, deleteById, restoreById, findDeleted, downloadPDF, emailInvoice, findPayments, addPayment, voidPayment };
