const express = require('express');
const router = express.Router();
const { uploadDocument, getMyDocuments, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/', protect, getMyDocuments);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
