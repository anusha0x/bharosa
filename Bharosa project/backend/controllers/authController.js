const User = require('../models/User');
const { generateToken, generateOTP } = require('../utils/jwt');
const { createNotification } = require('../services/notificationService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, mobile, aadhaar, password } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ success: false, message: 'Name and mobile are required.' });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered.' });
    }

    const user = await User.create({ name, mobile, aadhaar, password });

    await createNotification({
      userId: user._id,
      title: '🎉 Welcome to BHAROSA!',
      message: `Hi ${name}! Your account has been created. Start by filling your student profile to find matching scholarships.`,
      type: 'info',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send OTP to mobile
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ success: false, message: 'Mobile is required.' });

    let user = await User.findOne({ mobile });

    // Auto-create user if not found (OTP-first flow)
    if (!user) {
      user = await User.create({ name: 'New User', mobile });
    }

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };
    await user.save();

    // In production: send via SMS gateway (Twilio, MSG91, etc.)
    console.log(`📱 OTP for ${mobile}: ${otp}`); // Dev log

    res.json({
      success: true,
      message: `OTP sent to ${mobile}.`,
      // REMOVE in production:
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { mobile, otp, password } = req.body;

    if (!mobile) return res.status(400).json({ success: false, message: 'Mobile is required.' });

    const user = await User.findOne({ mobile }).select('+password +otp');
    if (!user) return res.status(404).json({ success: false, message: 'User not found. Please register.' });

    // OTP login
    if (otp) {
      if (!user.otp || !user.otp.code) {
        return res.status(400).json({ success: false, message: 'No OTP requested. Please request OTP first.' });
      }
      if (new Date() > user.otp.expiresAt) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }
      if (user.otp.code !== otp) {
        return res.status(401).json({ success: false, message: 'Invalid OTP.' });
      }
      user.otp = undefined;
      user.isVerified = true;
      await user.save();
    } else if (password) {
      // Password login
      if (!user.password) {
        return res.status(400).json({ success: false, message: 'This account uses OTP login.' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    } else {
      return res.status(400).json({ success: false, message: 'Provide OTP or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user name / aadhaar
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, aadhaar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(aadhaar && { aadhaar }) },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, sendOTP, login, getProfile, updateProfile };
