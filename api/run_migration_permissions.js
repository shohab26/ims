require('dotenv').config();
const fs = require('fs');
const pool = require('./connection');

async function runMigration() {
    try {
        const sql = fs.readFileSync('./migration_permissions.sql', 'utf8');
        await pool.query(sql);
        console.log('✅ Permissions Migration executed successfully!');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        process.exit(0);
    }
}

runMigration();
