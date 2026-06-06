const fs = require('fs');
const path = require('path');

const components = [
    { dir: 'products', module: 'products' },
    { dir: 'categories', module: 'categories' },
    { dir: 'warehouses', module: 'warehouse' },
    { dir: 'status', module: 'status' },
    { dir: 'vendors', module: 'vendors' },
    { dir: 'customers', module: 'customers' },
    { dir: 'stocks', module: 'stocks' },
    { dir: 'orders', module: 'orders' },
    { dir: 'delivery', module: 'delivery' }
];

const basePath = path.join(__dirname, 'src', 'app', 'components');

components.forEach(c => {
    const htmlFile = path.join(basePath, c.dir, `${c.dir}.component.html`);

    if (fs.existsSync(htmlFile)) {
        let htmlContent = fs.readFileSync(htmlFile, 'utf8');

        // Add *ngIf to Edit <a> tags
        htmlContent = htmlContent.replace(/<a([^>]*)onEditById([^>]*)>/g, (match, p1, p2) => {
            if (match.includes('*ngIf')) return match;
            return `<a${p1}onEditById${p2} *ngIf="authService.hasPermission('${c.module}', 'update')">`;
        });

        // Add *ngIf to Delete <a> tags
        htmlContent = htmlContent.replace(/<a([^>]*)delete[a-zA-Z]+\([^>]*\)([^>]*)>/g, (match, p1, p2) => {
            if (match.includes('*ngIf')) return match;
            const functionNamePart = match.split('delete')[1].split('(')[0];
            const argsPart = match.split('(')[1].split(')')[0];
            return `<a${p1}delete${functionNamePart}(${argsPart})${p2} *ngIf="authService.hasPermission('${c.module}', 'delete')">`;
        });

        fs.writeFileSync(htmlFile, htmlContent);
    }
});

console.log('✅ UI Permissions updated successfully for links');
