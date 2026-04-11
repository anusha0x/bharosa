const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  getEligibleSchemes,
} = require('../controllers/schemeController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.get('/', getAllSchemes);
router.get('/:id', getSchemeById);

// Protected
router.get('/eligible/:studentId', protect, getEligibleSchemes);

// Admin only
router.post('/', protect, adminOnly, createScheme);
router.put('/:id', protect, adminOnly, updateScheme);
router.delete('/:id', protect, adminOnly, deleteScheme);

module.exports = router;
