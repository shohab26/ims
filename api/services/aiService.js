const OpenAI = require('openai');
const pool = require('../connection');
const forecastService = require('./forecastService');
require('dotenv').config();

// Provider-agnostic: any OpenAI-compatible endpoint works (Hugging Face router,
// Groq, Ollama, OpenAI itself...). Configure via .env:
//   AI_BASE_URL  — default: Hugging Face inference router
//   AI_API_KEY   — falls back to HF_TOKEN
//   AI_MODEL     — must support tool/function calling for the chat assistant
const BASE_URL = process.env.AI_BASE_URL || 'https://router.huggingface.co/v1';
const API_KEY = process.env.AI_API_KEY || process.env.HF_TOKEN;
const MODEL = process.env.AI_MODEL || 'Qwen/Qwen2.5-72B-Instruct';

const client = new OpenAI({ baseURL: BASE_URL, apiKey: API_KEY });

// Some open models (e.g. Qwen3) emit <think>...</think> reasoning — strip it.
const cleanText = (text) => (text || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();

/**
 * Ask the model to explain demand forecasts in plain English.
 * `forecasts` is the output of forecastService.getForecasts() — one entry or many.
 */
const explainForecast = async (forecasts) => {
    const completion = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 2000,
        messages: [
            {
                role: 'system',
                content:
                    'You are an inventory analyst for a small business. You are given monthly sales history, ' +
                    'a moving-average forecast, current stock, and a recommended stock level per product. ' +
                    'Explain the situation in plain English for a non-technical shop manager. ' +
                    'For each product: one or two sentences covering recent sales, the trend, and a clear ' +
                    'restocking recommendation with concrete numbers. Keep it brief and concise. ' +
                    'No headers, no markdown tables; a short paragraph per product (or a compact bullet list if there are many).',
            },
            {
                role: 'user',
                content: `Here is the forecast data as JSON:\n${JSON.stringify(forecasts, null, 2)}\n\nExplain what this means and what I should restock.`,
            },
        ],
    });
    return cleanText(completion.choices[0]?.message?.content);
};

// ── Chat assistant with read-only inventory tools ──────────────────────────

const CHAT_TOOLS = [
    {
        type: 'function',
        function: {
            name: 'get_inventory_overview',
            description:
                'Get a snapshot of the whole inventory: product/vendor/customer counts, total stock, ' +
                'low-stock products (stock below 10), and total sales/purchase value. ' +
                'Call this first for general questions about the state of the business.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_sales_summary',
            description:
                'Monthly totals for the last 6 months: units sold and revenue from deliveries (sales to customers), ' +
                'and units purchased and spend from orders (purchases from vendors).',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_demand_forecast',
            description:
                'Per-product demand forecast based on the last 6 months of sales: moving average, trend %, ' +
                'recommended stock level, current stock, and shortfall. Sorted by most urgent shortfall first.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_products',
            description: 'Search products by name or code. Returns product info, price, category, and current stock.',
            parameters: {
                type: 'object',
                properties: {
                    keyword: { type: 'string', description: 'Search term matched against product name and code' },
                },
                required: ['keyword'],
            },
        },
    },
];

const runChatTool = async (name, input) => {
    switch (name) {
        case 'get_inventory_overview': {
            const [counts, lowStock, totals] = await Promise.all([
                pool.query(`SELECT
                    (SELECT COUNT(*) FROM products  WHERE is_deleted=FALSE) AS products,
                    (SELECT COUNT(*) FROM vendors   WHERE is_deleted=FALSE) AS vendors,
                    (SELECT COUNT(*) FROM customers WHERE is_deleted=FALSE) AS customers,
                    (SELECT COALESCE(SUM(quantity),0) FROM stocks WHERE is_deleted=FALSE) AS total_stock_units`),
                pool.query(`SELECT p.pname, p.pcode, SUM(s.quantity)::numeric AS stock
                    FROM stocks s JOIN products p ON p.id=s.productid
                    WHERE s.is_deleted=FALSE AND p.is_deleted=FALSE
                    GROUP BY p.id, p.pname, p.pcode
                    HAVING SUM(s.quantity) < 10 ORDER BY stock ASC LIMIT 20`),
                pool.query(`SELECT
                    (SELECT COALESCE(SUM(total_price),0) FROM delivery_details WHERE is_deleted=FALSE) AS total_sales_value,
                    (SELECT COALESCE(SUM(total_price),0) FROM order_details    WHERE is_deleted=FALSE) AS total_purchase_value`),
            ]);
            return { ...counts.rows[0], low_stock_products: lowStock.rows, ...totals.rows[0] };
        }
        case 'get_sales_summary': {
            const result = await pool.query(`
                SELECT to_char(date_trunc('month', createdate), 'YYYY-MM') AS month,
                       'sale' AS kind, SUM(quantity)::numeric AS units, SUM(total_price)::numeric AS value
                FROM delivery_details
                WHERE is_deleted=FALSE AND createdate >= date_trunc('month', NOW()) - INTERVAL '6 months'
                GROUP BY 1
                UNION ALL
                SELECT to_char(date_trunc('month', createdate), 'YYYY-MM'),
                       'purchase', SUM(quantity)::numeric, SUM(total_price)::numeric
                FROM order_details
                WHERE is_deleted=FALSE AND createdate >= date_trunc('month', NOW()) - INTERVAL '6 months'
                GROUP BY 1
                ORDER BY 1, 2`);
            return result.rows;
        }
        case 'get_demand_forecast':
            return forecastService.getForecasts();
        case 'search_products': {
            const result = await pool.query(
                `SELECT p.id, p.pname, p.pcode, p.price, c.cname AS category,
                        COALESCE(SUM(s.quantity), 0)::numeric AS current_stock
                 FROM products p
                 LEFT JOIN categories c ON c.id = p.pcate
                 LEFT JOIN stocks s ON s.productid = p.id AND s.is_deleted = FALSE
                 WHERE p.is_deleted = FALSE AND (p.pname ILIKE $1 OR p.pcode ILIKE $1)
                 GROUP BY p.id, p.pname, p.pcode, p.price, c.cname
                 LIMIT 25`,
                [`%${input.keyword}%`]
            );
            return result.rows;
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
};

const CHAT_SYSTEM_PROMPT =
    'You are the built-in AI assistant of InvenTrack, an inventory management system. ' +
    'You help staff understand their inventory: stock levels, sales, purchases, forecasts, and problems ' +
    'like low stock or falling demand. Use the provided tools to look up real data before answering — ' +
    'never invent numbers. Currency values are in the shop\'s local currency; report them as plain numbers. ' +
    'Keep responses focused, brief, and concise; answer in plain prose or short bullet lists, no markdown tables or headers. ' +
    'If a question is completely unrelated to the business or its inventory, politely decline and steer back to inventory topics.';

const MAX_TOOL_TURNS = 8;

/**
 * Multi-turn chat with tool access to the inventory DB.
 * `history` is an array of {role: 'user'|'assistant', content: string} from the client.
 * Returns the assistant's final text reply.
 */
const chat = async (history) => {
    const messages = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...history.map((m) => ({ role: m.role, content: String(m.content) })),
    ];

    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
        const completion = await client.chat.completions.create({
            model: MODEL,
            max_tokens: 2000,
            messages,
            tools: CHAT_TOOLS,
        });

        const msg = completion.choices[0]?.message;
        if (!msg) throw new Error('The AI provider returned an empty response.');

        if (!msg.tool_calls || msg.tool_calls.length === 0) {
            return cleanText(msg.content);
        }

        // Execute every requested tool and feed results back.
        messages.push(msg);
        for (const tc of msg.tool_calls) {
            let content;
            try {
                const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
                content = JSON.stringify(await runChatTool(tc.function.name, args));
            } catch (err) {
                content = `Error: ${err.message}`;
            }
            messages.push({ role: 'tool', tool_call_id: tc.id, content });
        }
    }

    throw new Error('The assistant took too many steps to answer. Please try a more specific question.');
};

module.exports = { explainForecast, chat };
