const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    categoryRequired: {
      type: [String],
      enum: ['General', 'SC', 'ST', 'OBC', 'EWS', 'Minority', 'All'],
      default: ['All'],
    },
    incomeLimitLabel: {
      type: String,
      enum: [
        'Below ₹1 Lakh', '₹1-3 Lakhs', '₹3-5 Lakhs',
        '₹5-8 Lakhs', 'Above ₹8 Lakhs', 'No Limit',
      ],
      default: 'No Limit',
    },
    incomeLimitNumeric: { type: Number, default: Infinity }, // stored as actual number
    stateEligibility: {
      type: [String],
      default: ['All'],
    },
    academicYearEligibility: {
      type: [String],
      default: ['All'],
    },
    genderEligibility: {
      type: String,
      enum: ['All', 'Female', 'Male'],
      default: 'All',
    },
    requiredDocuments: {
      type: [String],
      default: ['Aadhaar Card', 'Income Certificate', 'Bank Details'],
    },
    benefits: { type: String, required: true },
    amount: { type: String },
    officialLink: { type: String },
    tutorialLink: { type: String },
    deadline: { type: Date },
    deadlineLabel: { type: String },
    isActive: { type: Boolean, default: true },
    tags: [String],
    minimumPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scheme', schemeSchema);
