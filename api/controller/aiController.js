const aiService = require('../services/aiService');

const MAX_HISTORY = 30;

/**
 * POST /ai/chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }, ...] }
 * The client sends the whole conversation each time (stateless server).
 */
const chat = async (req, res) => {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: 'messages must be a non-empty array.' });
    }
    const valid = messages.every(
        (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== ''
    );
    if (!valid) {
        return res.status(400).json({ message: 'Each message needs a role (user/assistant) and non-empty text content.' });
    }
    if (messages[messages.length - 1].role !== 'user') {
        return res.status(400).json({ message: 'The last message must be from the user.' });
    }

    try {
        const reply = await aiService.chat(messages.slice(-MAX_HISTORY));
        res.status(200).json({ reply });
    } catch (err) {
        const status = err.status === 401 || err.status === 400 ? 502 : 500;
        res.status(status).json({ message: err.message || 'AI assistant failed to respond.' });
    }
};


/**
 * POST /ai/chat/stream
 * Same body as /ai/chat, but replies as Server-Sent Events so the UI can
 * render the answer while the model is still writing it.
 */
const chatStream = async (req, res) => {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: 'messages must be a non-empty array.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // don't let a proxy buffer the stream
    res.flushHeaders();

    const send = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);

    let closed = false;
    res.on('close', () => { closed = true; });

    // Emit immediately so the UI shows activity instead of an empty pane
    // while the model works through its first (slow) prefill.
    send({ type: 'status', text: 'Thinking\u2026' });

    try {
        await aiService.chatStream(messages.slice(-MAX_HISTORY), (event) => {
            if (!closed) send(event);
        });
    } catch (err) {
        if (!closed) send({ type: 'error', message: err.message || 'AI assistant failed to respond.' });
    } finally {
        if (!closed) res.end();
    }
};

module.exports = { chat, chatStream };
