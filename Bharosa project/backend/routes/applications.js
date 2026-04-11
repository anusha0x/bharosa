const express = require('express');
const router = express.Router();
const {
  applyToScheme,
  getStudentApplications,
  getMyApplications,
  getApplicationById,
  getApplicationStatus,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/apply', protect, applyToScheme);
router.get('/my', protect, getMyApplications);
router.get('/student/:studentId', protect, getStudentApplications);
router.get('/status/:applicationId', protect, getApplicationStatus);
router.get('/:id', protect, getApplicationById);
router.put('/:id/status', protect, adminOnly, updateApplicationStatus);

module.exports = router;
