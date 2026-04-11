const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    mobile: { type: String },
    state: {
      type: String,
      required: true,
      enum: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
        'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
        'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
        'West Bengal', 'Delhi', 'Other',
      ],
    },
    academicYear: {
      type: String,
      required: true,
      enum: [
        'Class 9', 'Class 10', 'Class 11', 'Class 12',
        '1st Year College', '2nd Year College', '3rd Year College',
        '4th Year College', 'Postgraduate', 'PhD',
      ],
    },
    category: {
      type: String,
      required: true,
      enum: ['General', 'SC', 'ST', 'OBC', 'EWS', 'Minority'],
    },
    income: {
      type: String,
      required: true,
      enum: [
        'Below ₹1 Lakh', '₹1-3 Lakhs', '₹3-5 Lakhs',
        '₹5-8 Lakhs', 'Above ₹8 Lakhs',
      ],
    },
    parentJob: {
      type: String,
      required: true,
      enum: [
        'Government Employee', 'Government Teacher', 'Private Employee',
        'Self-Employed', 'Farmer', 'Labour', 'Other',
      ],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfBirth: { type: Date },
    percentageInLastExam: { type: Number, min: 0, max: 100 },
    disability: { type: Boolean, default: false },
    digilockerVerified: { type: Boolean, default: false },
    digilockerData: { type: Object },
  },
  { timestamps: true }
);

// Virtual: income as numeric value for comparison
studentProfileSchema.virtual('incomeNumeric').get(function () {
  const map = {
    'Below ₹1 Lakh': 100000,
    '₹1-3 Lakhs': 300000,
    '₹3-5 Lakhs': 500000,
    '₹5-8 Lakhs': 800000,
    'Above ₹8 Lakhs': 1000001,
  };
  return map[this.income] || 0;
});

studentProfileSchema.set('toJSON', { virtuals: true });
studentProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
