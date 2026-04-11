const Scheme = require('../models/Scheme');
const StudentProfile = require('../models/StudentProfile');
const { calculateEligibility } = require('../services/eligibilityEngine');

// @desc    Get all active schemes
// @route   GET /api/schemes
// @access  Public
const getAllSchemes = async (req, res, next) => {
  try {
    const { category, state, search, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };
    if (category) query.categoryRequired = { $in: [category, 'All'] };
    if (state) query.stateEligibility = { $in: [state, 'All'] };
    if (search) query.schemeName = { $regex: search, $options: 'i' };

    const total = await Scheme.countDocuments(query);
    const schemes = await Scheme.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      schemes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single scheme
// @route   GET /api/schemes/:id
// @access  Public
const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found.' });
    res.json({ success: true, scheme });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a scheme (admin)
// @route   POST /api/schemes
// @access  Private/Admin
const createScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.create(req.body);
    res.status(201).json({ success: true, message: 'Scheme created.', scheme });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a scheme (admin)
// @route   PUT /api/schemes/:id
// @access  Private/Admin
const updateScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found.' });
    res.json({ success: true, message: 'Scheme updated.', scheme });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete scheme (admin)
// @route   DELETE /api/schemes/:id
// @access  Private/Admin
const deleteScheme = async (req, res, next) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Scheme deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get eligible schemes for a student
// @route   GET /api/schemes/eligible/:studentId
// @access  Private
const getEligibleSchemes = async (req, res, next) => {
  try {
    const student = await StudentProfile.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Security: only the student themselves or admin can view
    if (
      student.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const allSchemes = await Scheme.find({ isActive: true });

    const results = allSchemes
      .map((scheme) => {
        const result = calculateEligibility(student, scheme);
        return {
          schemeDetails: scheme,
          matchScore: result.matchScore,
          eligible: result.eligible,
          whyEligible: result.whyEligible,
          whyNotEligible: result.whyNotEligible,
        };
      })
      .filter((r) => r.eligible)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      totalMatches: results.length,
      student: {
        name: student.name,
        category: student.category,
        state: student.state,
        income: student.income,
        academicYear: student.academicYear,
      },
      eligibleSchemes: results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  getEligibleSchemes,
};
