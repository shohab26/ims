const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
        throw new Error('Gmail SMTP is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in api/.env.');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
};

const sendOtpEmail = async ({ to, fullName, otp }) => {
    const transporter = createTransporter();
    const from = process.env.MAIL_FROM || process.env.GMAIL_USER;

    await transporter.sendMail({
        from,
        to,
        subject: 'Inventory account verification code',
        text: [
            `Hello ${fullName || 'User'},`,
            '',
            `Your verification code is ${otp}.`,
            'Use this code to set your new password. It expires in 10 minutes.',
            '',
            'If you did not request this account, please contact your administrator.',
        ].join('\n'),
    });
};

const sendInvoiceEmail = async ({ to, customerName, invoiceNumber, total, dueDate, pdfBuffer }) => {
    const transporter = createTransporter();
    const from = process.env.MAIL_FROM || process.env.GMAIL_USER;
    const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    await transporter.sendMail({
        from,
        to,
        subject: `Invoice ${invoiceNumber} from InvenTrack`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111827">
          <div style="background:#1a1a2e;padding:24px 32px;border-radius:8px 8px 0 0">
            <h2 style="color:#fff;margin:0;font-size:22px">InvenTrack</h2>
            <p style="color:#94a3b8;margin:4px 0 0;font-size:13px">Inventory Management System</p>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px">
            <p style="font-size:15px">Dear <strong>${customerName}</strong>,</p>
            <p style="color:#374151">Please find your invoice attached to this email.</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
              <tr style="background:#f9fafb">
                <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;width:40%">Invoice Number</td>
                <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600">${invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280">Amount Due</td>
                <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1a1a2e">$${parseFloat(total || 0).toFixed(2)}</td>
              </tr>
              <tr style="background:#f9fafb">
                <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280">Due Date</td>
                <td style="padding:10px 14px;border:1px solid #e5e7eb">${fmt(dueDate)}</td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:13px">The invoice PDF is attached. If you have any questions, please contact us.</p>
            <p style="color:#6b7280;font-size:13px;margin-top:32px">Thank you for your business!<br><strong style="color:#1a1a2e">InvenTrack Team</strong></p>
          </div>
        </div>`,
        attachments: [{
            filename: `${invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        }],
    });
};

const sendLowStockAlertEmail = async ({ to, pname, pcode, quantity, reorder_level }) => {
    const transporter = createTransporter();
    const from = process.env.MAIL_FROM || process.env.GMAIL_USER;

    await transporter.sendMail({
        from,
        to,
        subject: `Low stock alert: ${pcode} — ${quantity} unit(s) left`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111827">
          <div style="background:#1a1a2e;padding:24px 32px;border-radius:8px 8px 0 0">
            <h2 style="color:#fff;margin:0;font-size:22px">InvenTrack</h2>
            <p style="color:#94a3b8;margin:4px 0 0;font-size:13px">Low Stock Alert</p>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px">
            <p style="font-size:15px">A product has fallen below its reorder level:</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
              <tr style="background:#f9fafb">
                <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;width:40%">Product</td>
                <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600">${pname} (${pcode})</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280">Current Stock</td>
                <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#ef4444">${quantity}</td>
              </tr>
              <tr style="background:#f9fafb">
                <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280">Reorder Level</td>
                <td style="padding:10px 14px;border:1px solid #e5e7eb">${reorder_level}</td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:13px">Please raise a purchase order to replenish this product.</p>
          </div>
        </div>`,
    });
};

module.exports = { sendOtpEmail, sendInvoiceEmail, sendLowStockAlertEmail };
