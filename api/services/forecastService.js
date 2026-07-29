const pool = require('../connection');

const MONTHS_OF_HISTORY = 6;
const MOVING_AVERAGE_WINDOW = 3;

/**
 * Monthly sales quantity per product for the last N months, from delivery_details.
 * In this system deliveries are outbound sales (they decrease stock via
 * stockService.decreaseStock), so they represent real demand — order_details are
 * inbound purchases and would forecast buying, not selling.
 */
const getMonthlySales = async (productId = null) => {
    const params = [];
    let productFilter = '';
    if (productId) {
        params.push(productId);
        productFilter = `AND d.productid = $${params.length}`;
    }
    const result = await pool.query(
        `SELECT d.productid,
                p.pname,
                p.pcode,
                date_trunc('month', d.createdate) AS month,
                SUM(d.quantity)::numeric AS quantity
         FROM delivery_details d
         JOIN products p ON p.id = d.productid
         WHERE d.is_deleted = FALSE
           AND d.createdate >= date_trunc('month', NOW()) - INTERVAL '${MONTHS_OF_HISTORY} months'
           ${productFilter}
         GROUP BY d.productid, p.pname, p.pcode, date_trunc('month', d.createdate)
         ORDER BY d.productid, month`,
        params
    );
    return result.rows;
};

const getCurrentStock = async () => {
    const result = await pool.query(
        `SELECT productid, SUM(quantity)::numeric AS stock
         FROM stocks
         WHERE is_deleted = FALSE
         GROUP BY productid`
    );
    const map = {};
    for (const row of result.rows) map[row.productid] = Number(row.stock);
    return map;
};

/**
 * Build per-product forecasts from monthly sales rows.
 * - movingAverage: simple moving average over the last MOVING_AVERAGE_WINDOW months
 * - trendPercent: month-over-month change of the two most recent months
 * - recommendedStock: moving average adjusted by the trend (clamped to ±50%
 *   so one spiky month doesn't produce absurd recommendations)
 */
const buildForecasts = (salesRows, stockByProduct) => {
    const byProduct = new Map();
    for (const row of salesRows) {
        if (!byProduct.has(row.productid)) {
            byProduct.set(row.productid, { productid: row.productid, pname: row.pname, pcode: row.pcode, months: [] });
        }
        byProduct.get(row.productid).months.push({
            month: row.month.toISOString().slice(0, 7),
            quantity: Number(row.quantity),
        });
    }

    const forecasts = [];
    for (const product of byProduct.values()) {
        const quantities = product.months.map(m => m.quantity);
        const window = quantities.slice(-MOVING_AVERAGE_WINDOW);
        const movingAverage = window.reduce((a, b) => a + b, 0) / window.length;

        let trendPercent = null;
        if (quantities.length >= 2) {
            const last = quantities[quantities.length - 1];
            const prev = quantities[quantities.length - 2];
            if (prev > 0) trendPercent = Math.round(((last - prev) / prev) * 100);
        }

        const clampedTrend = trendPercent === null ? 0 : Math.max(-50, Math.min(50, trendPercent));
        const recommendedStock = Math.ceil(movingAverage * (1 + clampedTrend / 100));
        const currentStock = stockByProduct[product.productid] ?? 0;

        forecasts.push({
            productid: product.productid,
            pname: product.pname,
            pcode: product.pcode,
            monthlySales: product.months,
            movingAverage: Math.round(movingAverage * 100) / 100,
            trendPercent,
            recommendedStock,
            currentStock,
            shortfall: Math.max(0, recommendedStock - currentStock),
        });
    }

    forecasts.sort((a, b) => b.shortfall - a.shortfall);
    return forecasts;
};

const getForecasts = async (productId = null) => {
    const [salesRows, stockByProduct] = await Promise.all([
        getMonthlySales(productId),
        getCurrentStock(),
    ]);
    return buildForecasts(salesRows, stockByProduct);
};

module.exports = { getForecasts, MONTHS_OF_HISTORY, MOVING_AVERAGE_WINDOW };
