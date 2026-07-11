const http = require("http");
const app = require('./index');
const pool = require('./connection');

const port = 3001;
const server = http.createServer(app);

server.listen(port, () => console.log(`API server running on port ${port}`));

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    server.close();
    await pool.end();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
