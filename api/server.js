const http = require("http");
const app = require('./index');
const cors = require('cors');

const port = 3001;

const server = http.createServer(app);

server.listen(port);