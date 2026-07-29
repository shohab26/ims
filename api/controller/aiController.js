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

module.exports = { chat };
