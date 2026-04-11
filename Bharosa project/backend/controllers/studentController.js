const StudentProfile = require('../models/StudentProfile');
const { createNotification } = require('../services/notificationService');

// @desc    Create student profile
// @route   POST /api/student/profile
// @access  Private
const createProfile = async (req, res, next) => {
  try {
    const existing = await StudentProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Profile already exists. Use PUT to update.' });
    }

    const profileData = { ...req.body, userId: req.user._id };
    const profile = await StudentProfile.create(profileData);

    await createNotification({
      userId: req.user._id,
      title: '✅ Profile Created',
      message: 'Your student profile has been saved. Check your eligible scholarships now!',
      type: 'info',
    });

    res.status(201).json({ success: true, message: 'Profile created.', profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please create one.' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.json({ success: true, message: 'Profile updated.', profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Get profile by student ID (admin or self)
// @route   GET /api/student/profile/:studentId
// @access  Private
const getProfileById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.studentId).populate('userId', 'name mobile');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProfile, getProfile, updateProfile, getProfileById };
