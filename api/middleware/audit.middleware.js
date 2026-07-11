const pool = require('../connection');

// Map route path segments to actual DB table names where they differ
const TABLE_MAP = {
    warehouse : 'warehouses',
    orders    : 'order_details',
    delivery  : 'delivery_details',
};

function resolveTable(entityType) {
    return TABLE_MAP[entityType] || entityType;
}

function resolveAction(method, urlPath) {
    if (urlPath.includes('/restore/')) return 'RESTORE';
    if (method === 'POST')   return 'CREATE';
    if (method === 'PATCH')  return 'UPDATE';
    if (method === 'DELETE') return 'DELETE';
    return null;
}

function extractId(urlPath) {
    const match = urlPath.match(/(\d+)(?:\?|$)/);
    return match ? parseInt(match[1], 10) : null;
}

function getIp(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;
}

/**
 * auditLog(entityType)
 *
 * Middleware that logs every POST / PATCH / DELETE to activity_logs.
 * - Fetches old_data from DB before the handler runs (for UPDATE / DELETE / RESTORE).
 * - Intercepts res.json so it only writes the log when the response is successful (< 400).
 * - The DB insert is fire-and-forget so it never delays the response.
 *
 * Usage in index.js:
 *   app.use('/products', verifyToken, checkPermission('products'), auditLog('products'), productsRoute);
 */
const auditLog = (entityType) => async (req, res, next) => {
    const action = resolveAction(req.method, req.path);
    if (!action) return next(); // GET requests — skip

    const entityId  = extractId(req.path);
    const tableName = resolveTable(entityType);

    // Fetch old record before the handler modifies it
    let oldData = null;
    if (entityId && action !== 'CREATE') {
        try {
            const r = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [entityId]);
            oldData = r.rows[0] || null;
        } catch (_) { /* non-fatal */ }
    }

    // Intercept res.json — runs after the route handler finishes
    const originalJson = res.json.bind(res);
    res.json = function (data) {
        if (res.statusCode < 400 && req.user) {
            const newData = (action === 'CREATE' || action === 'UPDATE') ? req.body : null;
            pool.query(
                `INSERT INTO activity_logs
                   (user_id, action, entity_type, entity_id, old_data, new_data, ip, created_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
                [
                    req.user.id,
                    action,
                    entityType,
                    entityId,
                    oldData  ? JSON.stringify(oldData)  : null,
                    newData  ? JSON.stringify(newData)  : null,
                    getIp(req),
                ]
            ).catch(e => console.error('Audit log insert failed:', e.message));
        }
        return originalJson(data);
    };

    next();
};

module.exports = { auditLog };
