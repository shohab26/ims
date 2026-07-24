const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Generic CSV serializer for {columns:[{key,label}], rows:[{...}]} report shapes.
 * Hand-rolled rather than pulling in a CSV lib — quoting/escaping for this shape is trivial.
 */
const toCSV = (columns, rows) => {
    const esc = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const header = columns.map(c => esc(c.label)).join(',');
    const lines = rows.map(row => columns.map(c => esc(row[c.key])).join(','));
    return [header, ...lines].join('\n');
};

/**
 * Generic tabular PDF for any report shape. Switches to landscape once a report
 * has enough columns that portrait would crush them unreadably.
 */
const toPDF = ({ title, columns, rows, summary = [] }) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: columns.length > 5 ? 'landscape' : 'portrait' });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a1a2e').text(title);
    doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    const tableWidth = doc.page.width - 80;
    const colWidth = tableWidth / columns.length;
    let y = doc.y;

    const drawHeader = () => {
        doc.rect(40, y, tableWidth, 20).fill('#1a1a2e');
        doc.font('Helvetica-Bold').fontSize(9);
        columns.forEach((c, i) => {
            doc.fillColor('#fff').text(c.label, 40 + i * colWidth + 4, y + 6, { width: colWidth - 8 });
        });
        y += 24;
    };

    drawHeader();
    doc.font('Helvetica').fontSize(9);
    rows.forEach((row, ri) => {
        if (y > doc.page.height - 80) { doc.addPage(); y = 40; drawHeader(); doc.font('Helvetica').fontSize(9); }
        doc.rect(40, y - 2, tableWidth, 18).fill(ri % 2 === 0 ? '#f8fafc' : '#ffffff');
        columns.forEach((c, i) => {
            const val = row[c.key];
            doc.fillColor('#111827').text(val === null || val === undefined ? '' : String(val), 40 + i * colWidth + 4, y + 2, { width: colWidth - 8 });
        });
        y += 18;
    });

    if (summary.length) {
        if (y > doc.page.height - 80) { doc.addPage(); y = 40; }
        y += 14;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#1a1a2e');
        summary.forEach(line => { doc.text(line, 40, y); y += 16; });
    }

    doc.end();
});

/**
 * Generic Excel workbook for any report shape.
 */
const toExcel = async ({ title, columns, rows, summary = [] }) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet((title || 'Report').substring(0, 31));
    sheet.columns = columns.map(c => ({ header: c.label, key: c.key, width: Math.max(c.label.length + 2, 14) }));
    sheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
    });
    rows.forEach(r => sheet.addRow(r));
    if (summary.length) {
        sheet.addRow([]);
        summary.forEach(line => sheet.addRow([line]));
    }
    return workbook.xlsx.writeBuffer();
};

module.exports = { toCSV, toPDF, toExcel };
