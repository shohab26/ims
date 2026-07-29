const forecastService = require('../services/forecastService');
const aiService = require('../services/aiService');

/**
 * GET /forecast
 * Numeric demand forecasts for all products (no AI call — free and fast).
 */
const findAll = async (req, res) => {
    try {
        const forecasts = await forecastService.getForecasts();
        res.status(200).json(forecasts);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to compute forecasts.' });
    }
};

/**
 * GET /forecast/:productId
 * Forecast for a single product.
 */
const findByProduct = async (req, res) => {
    try {
        const forecasts = await forecastService.getForecasts(req.params.productId);
        if (forecasts.length === 0) {
            return res.status(404).json({ message: 'No sales history found for this product in the last 6 months.' });
        }
        res.status(200).json(forecasts[0]);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to compute forecast.' });
    }
};

/**
 * POST /forecast/explain            — AI explanation for the top products (by shortfall)
 * POST /forecast/explain { productid } — AI explanation for one product
 */
const explain = async (req, res) => {
    try {
        const { productid } = req.body || {};
        const forecasts = await forecastService.getForecasts(productid || null);
        if (forecasts.length === 0) {
            return res.status(404).json({ message: 'No sales history found to explain.' });
        }
        // Cap the payload so the prompt stays small on large catalogs.
        const subset = productid ? forecasts : forecasts.slice(0, 10);
        const explanation = await aiService.explainForecast(subset);
        res.status(200).json({ explanation, forecasts: subset });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to generate AI explanation.' });
    }
};

module.exports = { findAll, findByProduct, explain };
