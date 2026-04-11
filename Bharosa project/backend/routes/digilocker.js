const express = require('express');
const router = express.Router();
const { verifyDigiLocker, getDigiLockerStatus } = require('../controllers/digilockerController');
const { protect } = require('../middleware/auth');

router.post('/verify', protect, verifyDigiLocker);
router.get('/status', protect, getDigiLockerStatus);

module.exports = router;
