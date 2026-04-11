const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const timelineEntrySchema = new mongoose.Schema({
  status: String,
  note: String,
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System' },
});

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      default: () => 'BHR-' + uuidv4().split('-')[0].toUpperCase(),
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Verification', 'Document Review', 'Approved', 'Rejected'],
      default: 'Submitted',
    },
    submittedAt: { type: Date, default: Date.now },
    documents: [
      {
        docType: String,
        filename: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    timeline: [timelineEntrySchema],
    remarks: { type: String },
    matchScore: { type: Number },
  },
  { timestamps: true }
);

// Auto-add initial timeline on create
applicationSchema.pre('save', function (next) {
  if (this.isNew) {
    this.timeline.push({
      status: 'Submitted',
      note: 'Application submitted successfully.',
    });
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
