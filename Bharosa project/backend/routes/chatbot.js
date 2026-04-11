const express = require('express');
const router = express.Router();
const { handleMessage } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

router.post('/message', protect, handleMessage);

module.exports = router;
