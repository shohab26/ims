const OpenAI = require('openai');
const pool = require('../connection');
const forecastService = require('./forecastService');
require('dotenv').config();

const BASE_URL = process.env.AI_BASE_URL || 'https://router.huggingface.co/v1';
const API_KEY = process.env.AI_API_KEY || process.env.HF_TOKEN;
const MODEL = process.env.AI_MODEL || 'Qwen/Qwen2.5-72B-Instruct';

// Optional local fallback, used when the primary provider is out of quota or
// unreachable. Free cloud tiers have small daily caps, so without this the
// assistant simply stops working for the rest of the day.
const FALLBACK_BASE_URL = process.env.AI_FALLBACK_BASE_URL || '';
const FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL || '';
const FALLBACK_API_KEY = process.env.AI_FALLBACK_API_KEY || 'ollama';

const KEEP_ALIVE = process.env.AI_KEEP_ALIVE || '30m';
const isOllama = (url) => /localhost|127\.0\.0\.1|:11434/.test(url);

/**
 * A provider is a client + model + the extra params that provider accepts.
 * keep_alive is Ollama-only: strict providers (Gemini) reject unknown fields
 * with a 400, so it must never leak into a cloud request.
 */
const makeProvider = (baseUrl, apiKey, model, label) => ({
    label,
    model,
    client: new OpenAI({ baseURL: baseUrl, apiKey, timeout: 300000 }),
    params: () => (isOllama(baseUrl) ? { model, keep_alive: KEEP_ALIVE } : { model }),
});

const primary = makeProvider(BASE_URL, API_KEY, MODEL, 'primary');
const fallback = FALLBACK_BASE_URL && FALLBACK_MODEL
    ? makeProvider(FALLBACK_BASE_URL, FALLBACK_API_KEY, FALLBACK_MODEL, 'fallback')
    : null;

// Worth retrying on the fallback provider: out of quota, rate limited, or down.
const shouldFallOver = (err) => {
    const s = err && err.status;
    return s === 429 || s === 402 || (typeof s === 'number' && s >= 500);
};

// Kept for backwards compatibility with the rest of this file.
const client = primary.client;
const baseParams = () => primary.params();
// Provider errors arrive as bare status codes ("400 status code (no body)").
// Translate the common ones into something a user can act on.
const friendlyError = (err) => {
    const status = err && err.status;
    if (status === 429) return new Error('The AI service is rate-limited right now (free tier). Wait a minute and try again.');
    if (status === 401 || status === 403) return new Error('The AI API key was rejected. Check AI_API_KEY in the server .env file.');
    if (status === 404) return new Error(`Model "${MODEL}" was not found for this provider. Check AI_MODEL in the server .env file.`);
    if (status === 400) return new Error('The AI provider rejected the request. This usually means an unsupported model or parameter.');
    if (status >= 500) return new Error('The AI service is temporarily unavailable. Please try again shortly.');
    return err;
};

const cleanText = (text) => (text || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();

const explainForecast = async (forecasts) => {
    const completion = await client.chat.completions.create({
        ...baseParams(),
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
            description: 'Counts, total stock, low-stock items, and total sales/purchase value. Use for general "how is the business doing" questions.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_sales_summary',
            description: 'Monthly sales and purchase totals for the last 6 months.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_demand_forecast',
            description: 'Per-product forecast: trend, recommended stock, current stock, shortfall. Use for restocking questions.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_products',
            description: 'Look up products by name or code, with price and current stock.',
            parameters: {
                type: 'object',
                properties: { keyword: { type: 'string', description: 'Name or code to match' } },
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
    'You are the AI assistant inside InvenTrack, an inventory management system. ' +
    'Answer questions about stock, sales, purchases and forecasts using the tools — never invent numbers. ' +
    'Be brief and concrete. Plain prose or short bullets; no markdown tables, headers or bold. ' +
    'Decline anything unrelated to the business.';

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
        let completion;
        try {
            completion = await client.chat.completions.create({
                ...baseParams(),
                max_tokens: 2000,
                messages,
                tools: CHAT_TOOLS,
            });
        } catch (err) {
            throw friendlyError(err);
        }

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


/**
 * Same as chat(), but streams the answer back as it is generated.
 * `onEvent` receives: {type:'status', text} while tools run,
 * {type:'delta', text} for each chunk of the answer, {type:'done'} at the end.
 */
const TOOL_STATUS = {
    get_inventory_overview: 'Checking inventory\u2026',
    get_sales_summary: 'Reading sales history\u2026',
    get_demand_forecast: 'Calculating forecast\u2026',
    search_products: 'Searching products\u2026',
};

const runChatStream = async (provider, history, onEvent) => {
    const messages = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...history.map((m) => ({ role: m.role, content: String(m.content) })),
    ];

    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
        const stream = await provider.client.chat.completions.create({
            ...provider.params(),
            max_tokens: 2000,
            messages,
            tools: CHAT_TOOLS,
            stream: true,
        });

        let content = '';
        const toolCalls = [];
        let inThink = false;

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (!delta) continue;

            if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                    const i = tc.index ?? 0;
                    if (!toolCalls[i]) toolCalls[i] = { id: '', type: 'function', function: { name: '', arguments: '' } };
                    if (tc.id) toolCalls[i].id = tc.id;
                    if (tc.function && tc.function.name) toolCalls[i].function.name += tc.function.name;
                    if (tc.function && tc.function.arguments) toolCalls[i].function.arguments += tc.function.arguments;
                    // Carry through provider-specific fields we don't understand.
                    // Gemini 3.x attaches extra_content.google.thought_signature to a
                    // tool call and rejects the follow-up request (400) if it is missing.
                    for (const key of Object.keys(tc)) {
                        if (!['index', 'id', 'type', 'function'].includes(key)) toolCalls[i][key] = tc[key];
                    }
                }
            }

            if (delta.content) {
                content += delta.content;
                let out = delta.content;
                if (inThink) {
                    const close = out.indexOf('</think>');
                    if (close === -1) continue;
                    out = out.slice(close + 8);
                    inThink = false;
                }
                const open = out.indexOf('<think>');
                if (open !== -1) {
                    inThink = true;
                    out = out.slice(0, open);
                }
                if (out) onEvent({ type: 'delta', text: out });
            }
        }

        const calls = toolCalls.filter(Boolean);
        if (calls.length === 0) {
            onEvent({ type: 'done' });
            return cleanText(content);
        }

        messages.push({ role: 'assistant', content: content || null, tool_calls: calls });
        for (const tc of calls) {
            onEvent({ type: 'status', text: TOOL_STATUS[tc.function.name] || 'Looking things up\u2026' });
            let result;
            try {
                const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
                result = JSON.stringify(await runChatTool(tc.function.name, args));
            } catch (err) {
                result = 'Error: ' + err.message;
            }
            messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
        }
    }

    throw new Error('The assistant took too many steps to answer. Please try a more specific question.');
};

/**
 * Public entry point: try the primary provider, and if it is out of quota,
 * rate limited, or down, transparently retry on the local fallback so the
 * assistant keeps working instead of dying for the rest of the day.
 */
const chatStream = async (history, onEvent) => {
    try {
        return await runChatStream(primary, history, onEvent);
    } catch (err) {
        if (!fallback || !shouldFallOver(err)) throw friendlyError(err);
        onEvent({ type: 'status', text: 'Cloud quota reached \u2014 switching to the local model\u2026' });
        try {
            return await runChatStream(fallback, history, onEvent);
        } catch (err2) {
            throw friendlyError(err2);
        }
    }
};

module.exports = { explainForecast, chat, chatStream };
