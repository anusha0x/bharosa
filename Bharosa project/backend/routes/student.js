const express = require('express');
const router = express.Router();
const { createProfile, getProfile, updateProfile, getProfileById } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.post('/profile', protect, createProfile);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/profile/:studentId', protect, getProfileById);

module.exports = router;
