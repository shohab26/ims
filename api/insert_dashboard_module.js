require('dotenv').config();
const pool = require('./connection');

async function run() {
    try {
        await pool.query(`INSERT INTO modules (module_name, display_name) VALUES ('dashboard', 'Dashboard') ON CONFLICT (module_name) DO NOTHING;`);
        console.log('✅ Dashboard module added successfully!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

run();
