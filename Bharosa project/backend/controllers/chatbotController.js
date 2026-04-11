const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const { calculateEligibility } = require('../services/eligibilityEngine');

// Intent detection
const detectIntent = (message) => {
  const msg = message.toLowerCase();
  if (/eligib|match|qualify|suitable|scheme for me/i.test(msg)) return 'check_eligibility';
  if (/document|certificate|upload|required|need/i.test(msg)) return 'required_documents';
  if (/status|application|applied|track/i.test(msg)) return 'application_status';
  if (/deadline|last date|due date|expire/i.test(msg)) return 'deadlines';
  if (/help|guide|how to|steps|process/i.test(msg)) return 'how_to_apply';
  if (/profile|details|form|information/i.test(msg)) return 'profile_help';
  if (/digilocker|aadhaar|verify/i.test(msg)) return 'digilocker';
  if (/income|salary|lakh|earning/i.test(msg)) return 'income_info';
  if (/category|sc|st|obc|general|caste/i.test(msg)) return 'category_info';
  if (/contact|support|helpline|phone|email/i.test(msg)) return 'contact';
  if (/hello|hi|hey|namaste/i.test(msg)) return 'greeting';
  if (/thank|thanks|shukriya/i.test(msg)) return 'thanks';
  return 'general';
};

const RESPONSES = {
  greeting: [
    'Namaste! 🙏 I\'m the BHAROSA Assistant. I\'m here to help you find and apply for scholarships. What would you like to know?',
    'Hello! Welcome to BHAROSA. Ask me about eligible scholarships, required documents, or your application status.',
  ],
  thanks: [
    'You\'re welcome! 😊 Best of luck with your scholarship applications. Is there anything else I can help you with?',
    'Happy to help! Feel free to ask if you have more questions about scholarships.',
  ],
  required_documents: {
    text: `📄 *Common Documents Required:*\n
1. **Aadhaar Card** – Both sides, clear scan
2. **Income Certificate** – Issued within 6 months, from Tehsildar
3. **Caste Certificate** – For SC/ST/OBC applicants (Govt. issued)
4. **12th/Latest Marksheet** – Attested copy
5. **Bank Passbook** – First page with account details
6. **Passport Photo** – Recent, white background
7. **Domicile Certificate** – For state-specific schemes

💡 *Tip:* Keep scanned copies (PDF or JPG, under 5MB) ready before applying.`,
  },
  how_to_apply: {
    text: `📋 *How to Apply on BHAROSA:*\n
**Step 1** – Register / Login with your mobile number
**Step 2** – Complete your Student Profile (name, state, category, income, etc.)
**Step 3** – Verify via DigiLocker (optional but recommended for faster processing)
**Step 4** – Browse your matched scholarships in the Eligibility Dashboard
**Step 5** – Click "Apply" on your desired scheme
**Step 6** – Upload required documents
**Step 7** – Track status in "My Applications"

⏱️ The whole process takes less than 15 minutes!`,
  },
  digilocker: {
    text: `🔐 *DigiLocker Verification:*\n
DigiLocker links your Aadhaar to your documents stored with the Government of India.

**Benefits of DigiLocker verification:**
• Faster application processing ⚡
• Auto-fill your profile data
• Documents pre-verified by government
• Higher trust score for your application

**How to verify:**
Go to Profile → Click "Verify with DigiLocker" → Enter your 12-digit Aadhaar number.

Your data is 100% secure and encrypted. 🔒`,
  },
  income_info: {
    text: `💰 *Income Eligibility Guide:*\n
Most scholarships have income limits. Here's a quick reference:

| Scheme Type | Income Limit |
|---|---|
| SC/ST Pre-Matric | ₹2.5 Lakh/year |
| OBC Post-Matric | ₹3 Lakh/year |
| National Merit | No income limit |
| Minority Scholarship | ₹2 Lakh/year |
| Girls Education | ₹5 Lakh/year |

📌 Income certificate must be issued by the Tehsildar or SDM of your district within the last 6 months.`,
  },
  category_info: {
    text: `📊 *Category-wise Scholarships:*\n
• **SC (Scheduled Caste)** – Pre & Post Matric, NSP schemes, state-specific
• **ST (Scheduled Tribe)** – Top Class Education, tribal welfare schemes
• **OBC** – Post Matric Scholarship, state schemes
• **General/EWS** – Merit-based, Girls education, Central sector
• **Minority** – Madrasa scholarship, Maulana Azad scheme

All categories have both central government and state government schemes available. Fill your profile to see your matched ones!`,
  },
  contact: {
    text: `📞 *BHAROSA Support:*\n
• **Helpline:** 1800-XXX-XXXX (Toll-free, Mon–Sat 9AM–6PM)
• **Email:** support@bharosa.gov.in
• **NSP Helpline:** 0120-6619540
• **State Scholarship Portal:** Check your state's official website

For technical issues on this portal, use the feedback form or reach out via email.`,
  },
  general: [
    'I\'m here to help with scholarship-related queries! You can ask me about:\n• 🎓 Eligible scholarships for you\n• 📄 Required documents\n• 📊 Application status\n• 📅 Upcoming deadlines\n• 🔐 DigiLocker verification',
    'Great question! Let me help you. Could you be more specific? For example: "What documents do I need?" or "Am I eligible for SC scholarships?"',
  ],
};

// @desc    Chatbot message handler
// @route   POST /api/chatbot/message
// @access  Private
const handleMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const intent = detectIntent(message);
    let responseText = '';
    let additionalData = null;

    // Dynamic intents that need DB lookup
    if (intent === 'check_eligibility') {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (!profile) {
        responseText = '📝 To check your eligibility, you first need to complete your student profile!\n\nGo to **Student Details** in the menu and fill in your information. It only takes 2 minutes. 😊';
      } else {
        const schemes = await Scheme.find({ isActive: true });
        const matches = schemes
          .map((s) => ({ scheme: s, ...calculateEligibility(profile, s) }))
          .filter((r) => r.eligible)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 3);

        if (matches.length === 0) {
          responseText = `Hi ${profile.name}! 🔍 Based on your current profile, I couldn't find exact matches. Try updating your profile or check back as new schemes are added regularly.`;
        } else {
          const list = matches.map((m, i) => `${i + 1}. **${m.scheme.schemeName}** — ${m.matchScore}% match (${m.scheme.amount || 'Amount TBD'})`).join('\n');
          responseText = `🎉 Great news ${profile.name}! You match **${matches.length}** scholarship(s):\n\n${list}\n\nVisit your **Eligibility Dashboard** to see all matches and apply!`;
          additionalData = { matchCount: matches.length, topSchemes: matches.map((m) => m.scheme.schemeName) };
        }
      }
    } else if (intent === 'application_status') {
      const apps = await Application.find({ userId: req.user._id })
        .populate('schemeId', 'schemeName')
        .sort({ createdAt: -1 })
        .limit(3);

      if (apps.length === 0) {
        responseText = '📋 You haven\'t applied to any schemes yet. Visit your **Eligibility Dashboard** to find and apply for scholarships that match your profile!';
      } else {
        const statusEmoji = { Submitted: '📬', 'Under Verification': '🔍', 'Document Review': '📄', Approved: '✅', Rejected: '❌' };
        const list = apps.map((a) => `${statusEmoji[a.status] || '•'} **${a.schemeId?.schemeName || 'Scheme'}** → ${a.status} (ID: ${a.applicationId})`).join('\n');
        responseText = `📊 Your recent applications:\n\n${list}\n\nFor full details, visit **My Applications**.`;
        additionalData = { applicationCount: apps.length };
      }
    } else if (intent === 'deadlines') {
      const upcoming = await Scheme.find({
        isActive: true,
        deadline: { $gte: new Date() },
      })
        .sort({ deadline: 1 })
        .limit(4)
        .select('schemeName deadlineLabel amount');

      if (upcoming.length === 0) {
        responseText = '📅 No upcoming deadlines found right now. New schemes are added regularly — check back soon!';
      } else {
        const list = upcoming.map((s) => `• **${s.schemeName}** – Due: ${s.deadlineLabel || 'Soon'} (${s.amount || ''})`).join('\n');
        responseText = `⏰ *Upcoming Scholarship Deadlines:*\n\n${list}\n\nDon't miss these! Apply now from your dashboard.`;
      }
    } else if (intent === 'profile_help') {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile) {
        responseText = `✅ Your profile is complete, ${profile.name}!\n\n**Your Details:**\n• State: ${profile.state}\n• Category: ${profile.category}\n• Income: ${profile.income}\n• Academic: ${profile.academicYear}\n\nTo update, go to **Student Details** in the menu.`;
      } else {
        responseText = '📝 Your profile is not yet created. Please go to **Student Details** and fill in your information. This helps us match you with the right scholarships!';
      }
    } else {
      // Static responses
      const resp = RESPONSES[intent];
      if (Array.isArray(resp)) {
        responseText = resp[Math.floor(Math.random() * resp.length)];
      } else if (resp?.text) {
        responseText = resp.text;
      } else {
        responseText = RESPONSES.general[0];
      }
    }

    res.json({
      success: true,
      intent,
      response: responseText,
      additionalData,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { handleMessage };
