const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const Scheme = require('../models/Scheme');
const { notifyStatusChange, createNotification } = require('../services/notificationService');
const { calculateEligibility } = require('../services/eligibilityEngine');

// @desc    Apply to a scheme
// @route   POST /api/applications/apply
// @access  Private
const applyToScheme = async (req, res, next) => {
  try {
    const { schemeId } = req.body;

    const student = await StudentProfile.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(400).json({ success: false, message: 'Please complete your student profile first.' });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found.' });

    // Duplicate check
    const existing = await Application.findOne({
      userId: req.user._id,
      schemeId,
      status: { $nin: ['Rejected'] },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this scheme.' });
    }

    // Calculate match score
    const eligibility = calculateEligibility(student, scheme);

    const application = await Application.create({
      studentId: student._id,
      userId: req.user._id,
      schemeId,
      matchScore: eligibility.matchScore,
    });

    await createNotification({
      userId: req.user._id,
      title: '📝 Application Submitted',
      message: `Your application for "${scheme.schemeName}" (ID: ${application.applicationId}) has been submitted successfully.`,
      type: 'status_update',
      relatedApplication: application._id,
      relatedScheme: scheme._id,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application: {
        ...application.toObject(),
        schemeName: scheme.schemeName,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applications for logged-in student
// @route   GET /api/applications/student/:studentId
// @access  Private
const getStudentApplications = async (req, res, next) => {
  try {
    const student = await StudentProfile.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    if (student.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const applications = await Application.find({ studentId: req.params.studentId })
      .populate('schemeId', 'schemeName amount deadlineLabel benefits')
      .sort({ createdAt: -1 });

    res.json({ success: true, total: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Get my applications (self)
// @route   GET /api/applications/my
// @access  Private
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('schemeId', 'schemeName amount deadlineLabel benefits requiredDocuments')
      .sort({ createdAt: -1 });

    res.json({ success: true, total: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single application detail
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('schemeId')
      .populate('studentId');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    if (application.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

// @desc    Get application status with timeline
// @route   GET /api/applications/status/:applicationId
// @access  Private
const getApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findOne({ applicationId: req.params.applicationId })
      .populate('schemeId', 'schemeName amount');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({
      success: true,
      applicationId: application.applicationId,
      status: application.status,
      scheme: application.schemeId,
      timeline: application.timeline,
      submittedAt: application.submittedAt,
      remarks: application.remarks,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (admin)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Submitted', 'Under Verification', 'Document Review', 'Approved', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const application = await Application.findById(req.params.id).populate('schemeId', 'schemeName');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    application.status = status;
    application.remarks = note || application.remarks;
    application.timeline.push({ status, note: note || `Status updated to ${status}.` });
    await application.save();

    await notifyStatusChange(
      application.userId,
      application._id,
      status,
      application.schemeId?.schemeName || 'Unknown Scheme'
    );

    res.json({ success: true, message: `Status updated to ${status}.`, application });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyToScheme,
  getStudentApplications,
  getMyApplications,
  getApplicationById,
  getApplicationStatus,
  updateApplicationStatus,
};
