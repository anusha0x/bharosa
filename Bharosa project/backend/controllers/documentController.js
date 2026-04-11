const Document = require('../models/Document');
const path = require('path');

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { docType } = req.body;
    if (!docType) {
      return res.status(400).json({ success: false, message: 'Document type (docType) is required.' });
    }

    const validTypes = ['aadhaar', 'income', 'caste', 'marksheet', 'bank', 'photo', 'other'];
    if (!validTypes.includes(docType)) {
      return res.status(400).json({ success: false, message: `Invalid docType. Use: ${validTypes.join(', ')}` });
    }

    // Replace old doc of same type if exists
    const existing = await Document.findOne({ userId: req.user._id, docType });
    if (existing) {
      // Optionally delete old file from disk here
      await Document.findByIdAndDelete(existing._id);
    }

    const doc = await Document.create({
      userId: req.user._id,
      docType,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: {
        _id: doc._id,
        docType: doc.docType,
        originalName: doc.originalName,
        filename: doc.filename,
        size: doc.size,
        uploadedAt: doc.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all documents for logged-in user
// @route   GET /api/documents
// @access  Private
const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id }).select('-path');
    res.json({ success: true, total: documents.length, documents });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

    if (doc.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDocument, getMyDocuments, deleteDocument };
