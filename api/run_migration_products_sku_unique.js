const fs = require('fs');
const path = require('path');
const pool = require('./connection');

const sql = fs.readFileSync(path.join(__dirname, 'migration_products_sku_unique.sql'), 'utf8');

pool.query(sql)
    .then(() => { console.log('Product SKU uniqueness migration applied successfully.'); process.exit(0); })
    .catch(err => { console.error('Migration failed:', err); process.exit(1); });
