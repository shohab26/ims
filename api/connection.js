const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: { rejectUnauthorized: false },
    max: 4,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.connect((err) => {
    if (err) {
        console.log('PostgreSQL connection error:', err);
    } else {
        console.log('Connected to PostgreSQL.');
    }
});

module.exports = pool;
