const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');

router.post('/chat', aiController.chat);
router.post('/chat/stream', aiController.chatStream);

module.exports = router;
