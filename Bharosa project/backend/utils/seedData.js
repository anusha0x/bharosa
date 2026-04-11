require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');
const User = require('../models/User');
const connectDB = require('../config/db');

const schemes = [
  {
    schemeName: 'National Merit Scholarship 2026',
    description:
      'A prestigious merit-based scholarship awarded to students who have scored above 85% in their 12th standard examinations. Open to all categories with no income restriction.',
    categoryRequired: ['All'],
    incomeLimitLabel: 'No Limit',
    incomeLimitNumeric: 9999999,
    stateEligibility: ['All'],
    academicYearEligibility: ['1st Year College', '2nd Year College'],
    genderEligibility: 'All',
    requiredDocuments: ['Aadhaar Card', '12th Marksheet', 'Bank Details', 'Passport Photo'],
    benefits: 'Up to ₹50,000 per year for tuition, books, and living expenses.',
    amount: '₹50,000/year',
    officialLink: 'https://scholarships.gov.in',
    tutorialLink: 'https://youtube.com',
    deadlineLabel: 'March 31, 2026',
    deadline: new Date('2026-03-31'),
    tags: ['merit', 'central', 'all-india'],
    minimumPercentage: 85,
    isActive: true,
  },
  {
    schemeName: 'SC/ST Pre-Matric Scholarship',
    description:
      'Financial assistance for SC/ST students studying in Class 9 and 10 to prevent dropout and encourage continued education.',
    categoryRequired: ['SC', 'ST'],
    incomeLimitLabel: '₹1-3 Lakhs',
    incomeLimitNumeric: 250000,
    stateEligibility: ['All'],
    academicYearEligibility: ['Class 9', 'Class 10'],
    genderEligibility: 'All',
    requiredDocuments: ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'Bank Details', 'School ID'],
    benefits: 'Day scholars: ₹150/month. Hostellers: ₹350/month. Annual ad-hoc grant included.',
    amount: '₹15,000/year',
    officialLink: 'https://scholarships.gov.in',
    deadlineLabel: 'April 15, 2026',
    deadline: new Date('2026-04-15'),
    tags: ['SC', 'ST', 'pre-matric', 'central'],
    minimumPercentage: 0,
    isActive: true,
  },
  {
    schemeName: 'Girls Education Empowerment Scholarship',
    description:
      'Empowering female students across India through financial support to pursue higher education without interruption.',
    categoryRequired: ['All'],
    incomeLimitLabel: '₹3-5 Lakhs',
    incomeLimitNumeric: 500000,
    stateEligibility: ['All'],
    academicYearEligibility: ['Class 11', 'Class 12', '1st Year College', '2nd Year College', '3rd Year College'],
    genderEligibility: 'Female',
    requiredDocuments: ['Aadhaar Card', 'Income Certificate', 'Bank Details', '10th Marksheet', 'Passport Photo'],
    benefits: 'Annual scholarship of ₹30,000 covering tuition and accommodation.',
    amount: '₹30,000/year',
    officialLink: 'https://wcd.nic.in',
    deadlineLabel: 'March 25, 2026',
    deadline: new Date('2026-03-25'),
    tags: ['girls', 'women', 'gender', 'central'],
    minimumPercentage: 60,
    isActive: true,
  },
  {
    schemeName: 'Minority Community Higher Education Scholarship',
    description:
      'Supporting students from notified minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) in pursuing higher education.',
    categoryRequired: ['Minority'],
    incomeLimitLabel: '₹3-5 Lakhs',
    incomeLimitNumeric: 500000,
    stateEligibility: ['All'],
    academicYearEligibility: [
      '1st Year College', '2nd Year College', '3rd Year College', '4th Year College', 'Postgraduate',
    ],
    genderEligibility: 'All',
    requiredDocuments: ['Aadhaar Card', 'Minority Certificate', 'Income Certificate', 'Bank Details', 'Admission Letter'],
    benefits: 'Full tuition fee reimbursement + maintenance allowance up to ₹25,000/year.',
    amount: '₹25,000/year',
    officialLink: 'https://minorityaffairs.gov.in',
    deadlineLabel: 'April 10, 2026',
    deadline: new Date('2026-04-10'),
    tags: ['minority', 'higher education', 'central'],
    minimumPercentage: 50,
    isActive: true,
  },
  {
    schemeName: 'OBC Post-Matric Scholarship',
    description:
      'Post-matric scholarship scheme for Other Backward Classes students to pursue education beyond Class 10, including professional and technical courses.',
    categoryRequired: ['OBC'],
    incomeLimitLabel: '₹1-3 Lakhs',
    incomeLimitNumeric: 300000,
    stateEligibility: ['All'],
    academicYearEligibility: [
      'Class 11', 'Class 12', '1st Year College', '2nd Year College',
      '3rd Year College', '4th Year College', 'Postgraduate',
    ],
    genderEligibility: 'All',
    requiredDocuments: ['Aadhaar Card', 'OBC Certificate', 'Income Certificate', 'Bank Details', 'Admission Proof'],
    benefits: 'Maintenance allowance + tuition fee reimbursement up to ₹20,000/year.',
    amount: '₹20,000/year',
    officialLink: 'https://scholarships.gov.in',
    deadlineLabel: 'March 28, 2026',
    deadline: new Date('2026-03-28'),
    tags: ['OBC', 'post-matric', 'central'],
    minimumPercentage: 0,
    isActive: true,
  },
  {
    schemeName: 'ST Top Class Education Scholarship',
    description:
      'Supports meritorious Scheduled Tribe students admitted to top institutions across India including IITs, IIMs, NITs, and premier medical colleges.',
    categoryRequired: ['ST'],
    incomeLimitLabel: '₹3-5 Lakhs',
    incomeLimitNumeric: 500000,
    stateEligibility: ['All'],
    academicYearEligibility: ['1st Year College', '2nd Year College', '3rd Year College', '4th Year College', 'Postgraduate'],
    genderEligibility: 'All',
    requiredDocuments: ['Aadhaar Card', 'ST Certificate', 'Income Certificate', 'Bank Details', 'Institution Admission Letter'],
    benefits: 'Full fee reimbursement + laptop grant of ₹45,000 + book allowance ₹3,000.',
    amount: '₹75,000+/year',
    officialLink: 'https://tribal.nic.in',
    deadlineLabel: 'April 30, 2026',
    deadline: new Date('2026-04-30'),
    tags: ['ST', 'top-class', 'merit', 'central'],
    minimumPercentage: 75,
    isActive: true,
  },
  {
    schemeName: 'Maharashtra Swadhar Yojana',
    description:
      'State government scheme for SC and Nav-Buddha students of Maharashtra pursuing education in Class 11, 12, and college who do not have government hostel facilities.',
    categoryRequired: ['SC'],
    incomeLimitLabel: '₹1-3 Lakhs',
    incomeLimitNumeric: 250000,
    stateEligibility: ['Maharashtra'],
    academicYearEligibility: ['Class 11', 'Class 12', '1st Year College', '2nd Year College', '3rd Year College'],
    genderEligibility: 'All',
    requiredDocuments: ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'Bank Details', 'Domicile Certificate'],
    benefits: 'Board, lodging, and other expenses: ₹51,000/year (general) or ₹53,000/year (professional courses).',
    amount: '₹51,000–₹53,000/year',
    officialLink: 'https://sjsa.maharashtra.gov.in',
    deadlineLabel: 'May 15, 2026',
    deadline: new Date('2026-05-15'),
    tags: ['SC', 'Maharashtra', 'state', 'swadhar'],
    minimumPercentage: 60,
    isActive: true,
  },
  {
    schemeName: 'EWS Central Sector Scholarship',
    description:
      'Scholarship for Economically Weaker Section students from the general category pursuing higher education in accredited colleges and universities.',
    categoryRequired: ['General', 'EWS'],
    incomeLimitLabel: 'Below ₹1 Lakh',
    incomeLimitNumeric: 100000,
    stateEligibility: ['All'],
    academicYearEligibility: ['1st Year College', '2nd Year College', '3rd Year College', '4th Year College'],
    genderEligibility: 'All',
    requiredDocuments: ['Aadhaar Card', 'EWS Certificate', 'Income Certificate', 'Bank Details', 'Marksheet'],
    benefits: '₹10,000/year for fresher year and ₹20,000/year for subsequent years.',
    amount: '₹20,000/year',
    officialLink: 'https://scholarships.gov.in',
    deadlineLabel: 'April 5, 2026',
    deadline: new Date('2026-04-05'),
    tags: ['EWS', 'general', 'central', 'income-based'],
    minimumPercentage: 80,
    isActive: true,
  },
  {
    schemeName: 'Rajasthan Ambedkar DBT Voucher Yojana',
    description:
      'Rajasthan state scheme providing accommodation allowance to SC/OBC students studying in government colleges in divisional headquarters.',
    categoryRequired: ['SC', 'OBC'],
    incomeLimitLabel: '₹1-3 Lakhs',
    incomeLimitNumeric: 250000,
    stateEligibility: ['Rajasthan'],
    academicYearEligibility: ['1st Year College', '2nd Year College', '3rd Year College'],
    genderEligibility: 'All',
    requiredDocuments: ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'Bank Details', 'Domicile Certificate', 'College ID'],
    benefits: '₹10,000/year accommodation allowance directly transferred to bank account.',
    amount: '₹10,000/year',
    officialLink: 'https://sje.rajasthan.gov.in',
    deadlineLabel: 'June 1, 2026',
    deadline: new Date('2026-06-01'),
    tags: ['SC', 'OBC', 'Rajasthan', 'state', 'DBT'],
    minimumPercentage: 0,
    isActive: true,
  },
  {
    schemeName: 'Begum Hazrat Mahal National Scholarship',
    description:
      'Scholarship exclusively for meritorious girls from minority communities studying in Class 9 to 12, aimed at reducing dropout rates.',
    categoryRequired: ['Minority'],
    incomeLimitLabel: '₹1-3 Lakhs',
    incomeLimitNumeric: 200000,
    stateEligibility: ['All'],
    academicYearEligibility: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    genderEligibility: 'Female',
    requiredDocuments: ['Aadhaar Card', 'Minority Certificate', 'Income Certificate', 'Bank Details', 'School ID', 'Marksheet'],
    benefits: 'Class 9–10: ₹5,000/year | Class 11–12: ₹6,000/year.',
    amount: '₹5,000–₹6,000/year',
    officialLink: 'https://maulanaazad.org',
    deadlineLabel: 'September 30, 2026',
    deadline: new Date('2026-09-30'),
    tags: ['minority', 'girls', 'pre-matric', 'Hazrat-Mahal'],
    minimumPercentage: 50,
    isActive: true,
  },
];

const seedAdmin = {
  name: 'BHAROSA Admin',
  mobile: '9999999999',
  password: 'admin@bharosa123',
  role: 'admin',
  isVerified: true,
};

const seedDatabase = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing
  await Scheme.deleteMany({});
  await User.deleteMany({ role: 'admin' });

  // Insert schemes
  const inserted = await Scheme.insertMany(schemes);
  console.log(`✅ Inserted ${inserted.length} scholarship schemes.`);

  // Insert admin user
  const admin = await User.create(seedAdmin);
  console.log(`✅ Admin user created. Mobile: ${admin.mobile} | Password: admin@bharosa123`);

  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
