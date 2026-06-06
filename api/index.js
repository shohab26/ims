const express = require('express');
const connection = require('./connection');
const cors = require('cors');
const { verifyToken, checkPermission } = require('./middleware/auth.middleware');

// Routes
const authRoute = require('./routes/auth');           // public
const rolesAdminRoute = require('./routes/roles_admin'); // super_admin only
const usersAdminRoute = require('./routes/users_admin'); // super_admin only

const bookRoute = require('./routes/book');
const warehouseRoute = require('./routes/warehoues');
const statusRoute = require('./routes/status');
const categoriesRoute = require('./routes/categories');
const productsRoute = require('./routes/products');
const vendorRoute = require('./routes/vendors');
const customerRoute = require('./routes/customers');
const stockRoute = require('./routes/stock');
const orderRoute = require('./routes/order');
const deliveryRoute = require('./routes/delivery');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Public routes (no auth required) ─────────────────────────
app.use('/auth', authRoute);

// ── Admin-only routes (middleware inside route file) ──────────
app.use('/admin/roles', rolesAdminRoute);
app.use('/admin/users', usersAdminRoute);

// ── Protected inventory routes (verifyToken applied here) ─────
app.use('/book',       verifyToken, bookRoute); // Keep bookRoute for backward compatibility if needed without specific permission
app.use('/warehouse',  verifyToken, checkPermission('warehouse'), warehouseRoute);
app.use('/status',     verifyToken, checkPermission('status'), statusRoute);
app.use('/vendors',    verifyToken, checkPermission('vendors'), vendorRoute);
app.use('/customers',  verifyToken, checkPermission('customers'), customerRoute);
app.use('/categories', verifyToken, checkPermission('categories'), categoriesRoute);
app.use('/products',   verifyToken, checkPermission('products'), productsRoute);
app.use('/stocks',     verifyToken, checkPermission('stocks'), stockRoute);
app.use('/orders',     verifyToken, checkPermission('orders'), orderRoute);
app.use('/delivery',   verifyToken, checkPermission('delivery'), deliveryRoute);

module.exports = app;