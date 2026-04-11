const StudentProfile = require('../models/StudentProfile');
const { createNotification } = require('../services/notificationService');

// Simulated DigiLocker dummy data bank
const DUMMY_DIGILOCKER_DATA = {
  '123456789012': {
    name: 'Ravi Kumar',
    dob: '2001-05-15',
    state: 'Uttar Pradesh',
    gender: 'Male',
    category: 'OBC',
    aadhaarVerified: true,
    incomeCertificate: true,
    casteCertificate: true,
    marksheet12: { percentage: 78, year: 2022 },
  },
  '234567890123': {
    name: 'Priya Sharma',
    dob: '2002-08-22',
    state: 'Maharashtra',
    gender: 'Female',
    category: 'General',
    aadhaarVerified: true,
    incomeCertificate: false,
    casteCertificate: false,
    marksheet12: { percentage: 91, year: 2023 },
  },
  '345678901234': {
    name: 'Arjun Meena',
    dob: '2000-11-03',
    state: 'Rajasthan',
    gender: 'Male',
    category: 'ST',
    aadhaarVerified: true,
    incomeCertificate: true,
    casteCertificate: true,
    marksheet12: { percentage: 65, year: 2021 },
  },
};

// @desc    Simulate DigiLocker verification
// @route   POST /api/digilocker/verify
// @access  Private
const verifyDigiLocker = async (req, res, next) => {
  try {
    const { aadhaar } = req.body;

    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({ success: false, message: 'Valid 12-digit Aadhaar number is required.' });
    }

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800));

    // Look up dummy data or generate generic verified response
    const digiData = DUMMY_DIGILOCKER_DATA[aadhaar] || {
      name: req.user.name,
      aadhaarVerified: true,
      incomeCertificate: false,
      casteCertificate: false,
      marksheet12: null,
    };

    // Update student profile if exists
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (profile) {
      profile.digilockerVerified = true;
      profile.digilockerData = digiData;
      if (digiData.state && !profile.state) profile.state = digiData.state;
      if (digiData.category && !profile.category) profile.category = digiData.category;
      await profile.save();
    }

    await createNotification({
      userId: req.user._id,
      title: '✅ DigiLocker Verified',
      message: 'Your DigiLocker account has been verified. Your documents are now linked.',
      type: 'info',
    });

    res.json({
      success: true,
      verified: true,
      message: 'DigiLocker verification successful.',
      studentData: {
        name: digiData.name,
        gender: digiData.gender,
        state: digiData.state,
        category: digiData.category,
        documentsAvailable: {
          aadhaar: digiData.aadhaarVerified,
          incomeCertificate: digiData.incomeCertificate,
          casteCertificate: digiData.casteCertificate,
          marksheet12: !!digiData.marksheet12,
        },
        academicData: digiData.marksheet12 || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get DigiLocker verification status
// @route   GET /api/digilocker/status
// @access  Private
const getDigiLockerStatus = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    res.json({
      success: true,
      verified: profile?.digilockerVerified || false,
      data: profile?.digilockerData || null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyDigiLocker, getDigiLockerStatus };
