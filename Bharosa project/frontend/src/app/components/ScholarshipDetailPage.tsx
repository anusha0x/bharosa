import { Link, useParams } from "react-router";
import { Award, Calendar, IndianRupee, FileText, ExternalLink, Play, CheckCircle, AlertCircle } from "lucide-react";

export function ScholarshipDetailPage() {
  const { id } = useParams();

  // Mock data - in real app, fetch based on id
  const scholarship = {
    id: id,
    name: "National Merit Scholarship 2026",
    amount: "₹50,000",
    deadline: "March 31, 2026",
    match: 95,
    category: "Merit-based",
    description: "The National Merit Scholarship is a prestigious program designed to support academically excellent students across India. This scholarship aims to encourage and reward students who have demonstrated outstanding academic performance.",
    benefits: [
      "One-time payment of ₹50,000",
      "Certificate of Excellence",
      "Priority in campus placements",
      "Mentorship opportunities",
      "Access to exclusive workshops",
    ],
    eligibility: [
      "Indian citizen with valid Aadhaar card",
      "Minimum 85% marks in 12th standard",
      "Age should be below 25 years",
      "Enrolled in a recognized institution",
      "Annual family income below ₹8 lakhs",
      "No previous scholarship from government",
    ],
    documents: [
      "Aadhaar Card (both sides)",
      "12th Standard Marksheet",
      "Income Certificate (issued within 6 months)",
      "Caste Certificate (if applicable)",
      "Bank Account Details (passbook copy)",
      "Recent Passport Size Photograph",
      "College Admission Letter",
    ],
    officialWebsite: "https://scholarships.gov.in",
    tutorialVideo: "https://www.youtube.com/watch?v=example",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/scholarships" className="hover:text-primary">Scholarships</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{scholarship.name}</span>
        </div>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white mb-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Award className="w-8 h-8" />
                </div>
                <span className="px-4 py-1 bg-white/20 rounded-full text-sm">
                  {scholarship.category}
                </span>
              </div>
              <h1 className="text-4xl mb-3">{scholarship.name}</h1>
              <p className="text-white/90 text-lg">{scholarship.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Scholarship Amount</p>
                <p className="text-2xl">{scholarship.amount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Application Deadline</p>
                <p className="text-2xl">{scholarship.deadline}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Your Match Score</p>
                <p className="text-2xl">{scholarship.match}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Benefits */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Benefits
              </h2>
              <ul className="space-y-3">
                {scholarship.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-primary" />
                Eligibility Criteria
              </h2>
              <ul className="space-y-3">
                {scholarship.eligibility.map((criteria, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm text-primary">{idx + 1}</span>
                    </div>
                    <span className="text-muted-foreground">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Required Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scholarship.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <FileText className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tutorial Video */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <Play className="w-6 h-6 text-primary" />
                How to Apply - Video Tutorial
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/_mHYHCJyKkY?si=EAEj454vqGzbPHXN"
                  title="How to Apply - Video Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Watch this step-by-step guide to understand the application process
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-border sticky top-20">
              <div className="mb-6">
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600">You are eligible!</span>
                </div>
                <div className="flex items-center gap-2 p-4 bg-accent/10 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  <span className="text-accent text-sm">Deadline in 16 days</span>
                </div>
              </div>

              <Link
                to="/documents"
                className="block w-full text-center px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-xl transition-all mb-3"
              >
                Apply Now
              </Link>
              
              <a
                href={scholarship.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Official Website</span>
              </a>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="mb-3">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Our support team is here to assist you with any questions
                </p>
                <button className="w-full px-6 py-3 bg-muted rounded-xl hover:bg-muted/70 transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}