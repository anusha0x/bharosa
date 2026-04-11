/**
 * Eligibility Matching Engine
 * Compares a student profile against scheme requirements
 * Returns a matchScore (0-100) and reasons.
 */

const INCOME_MAP = {
  'Below ₹1 Lakh': 100000,
  '₹1-3 Lakhs': 300000,
  '₹3-5 Lakhs': 500000,
  '₹5-8 Lakhs': 800000,
  'Above ₹8 Lakhs': 9999999,
};

function calculateEligibility(student, scheme) {
  let score = 0;
  const maxScore = 100;
  const reasons = [];
  const mismatches = [];

  // 1. Category check (30 points)
  const catEligible =
    scheme.categoryRequired.includes('All') ||
    scheme.categoryRequired.includes(student.category);
  if (catEligible) {
    score += 30;
    reasons.push(`Category ${student.category} is eligible.`);
  } else {
    mismatches.push(`Scheme requires ${scheme.categoryRequired.join('/')} category.`);
    return { eligible: false, matchScore: 0, whyEligible: [], whyNotEligible: mismatches };
  }

  // 2. Income check (25 points)
  const studentIncome = INCOME_MAP[student.income] || 0;
  const incomeLimit = scheme.incomeLimitNumeric || Infinity;
  if (studentIncome <= incomeLimit) {
    score += 25;
    reasons.push(`Family income (${student.income}) is within the limit.`);
  } else {
    mismatches.push(`Income exceeds scheme limit of ₹${(incomeLimit / 100000).toFixed(1)} Lakh.`);
    return { eligible: false, matchScore: 0, whyEligible: [], whyNotEligible: mismatches };
  }

  // 3. State check (20 points)
  const stateEligible =
    scheme.stateEligibility.includes('All') ||
    scheme.stateEligibility.includes(student.state);
  if (stateEligible) {
    score += 20;
    reasons.push(`State ${student.state} is covered.`);
  } else {
    mismatches.push(`Scheme is only for: ${scheme.stateEligibility.join(', ')}.`);
    return { eligible: false, matchScore: 0, whyEligible: [], whyNotEligible: mismatches };
  }

  // 4. Academic year check (15 points)
  const yearEligible =
    scheme.academicYearEligibility.includes('All') ||
    scheme.academicYearEligibility.includes(student.academicYear);
  if (yearEligible) {
    score += 15;
    reasons.push(`Academic level (${student.academicYear}) is eligible.`);
  } else {
    mismatches.push(`Scheme covers: ${scheme.academicYearEligibility.join(', ')}.`);
    // Partial mismatch — reduce score but don't exclude
    score -= 10;
    mismatches.push('Academic year may not match perfectly.');
  }

  // 5. Gender check (5 points)
  const genderEligible =
    scheme.genderEligibility === 'All' ||
    scheme.genderEligibility === student.gender;
  if (genderEligible) {
    score += 5;
  } else {
    mismatches.push(`Scheme is for ${scheme.genderEligibility} students only.`);
    return { eligible: false, matchScore: 0, whyEligible: [], whyNotEligible: mismatches };
  }

  // 6. DigiLocker bonus (5 points)
  if (student.digilockerVerified) {
    score += 5;
    reasons.push('DigiLocker verified — faster processing.');
  }

  const finalScore = Math.min(Math.max(score, 0), maxScore);

  return {
    eligible: finalScore >= 50,
    matchScore: finalScore,
    whyEligible: reasons,
    whyNotEligible: mismatches,
  };
}

module.exports = { calculateEligibility };
