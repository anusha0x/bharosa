import { useState } from "react";
import { useNavigate } from "react-router";
import { User, MapPin, GraduationCap, Users, Wallet, Briefcase, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { createStudentProfile, updateStudentProfile } from "../../api/student";
import { useAuth } from "../../context/AuthContext";

const INCOME_MAP: Record<string, number> = {
  "Below ₹1 Lakh": 75000,
  "₹1-3 Lakhs": 200000,
  "₹3-5 Lakhs": 400000,
  "₹5-8 Lakhs": 650000,
  "Above ₹8 Lakhs": 900000,
};

const ACADEMIC_YEAR_MAP: Record<string, number> = {
  "Class 10": 1, "Class 12": 2, "1st Year College": 1,
  "2nd Year College": 2, "3rd Year College": 3, "4th Year College": 4, "Postgraduate": 5,
};

export function StudentDetailsForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [formData, setFormData] = useState({
    name: "", state: "", academicYear: "", category: "", income: "", parentJob: "", gender: "",
  });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  // ── Validation per step ──────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    setValidationError("");
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setValidationError("Please enter your full name to continue.");
          return false;
        }
        if (formData.name.trim().length < 2) {
          setValidationError("Please enter a valid full name.");
          return false;
        }
        break;
      
      case 2: // New Gender Validation
        if (!formData.gender) {
          setValidationError("Please select your gender to continue.");
          return false;
        }
        break;
      case 3:
        if (!formData.state) {
          setValidationError("Please select your state to continue.");
          return false;
        }
        break;
      case 4:
        if (!formData.academicYear) {
          setValidationError("Please select your academic year to continue.");
          return false;
        }
        break;
      case 5:
        if (!formData.category) {
          setValidationError("Please select your category to continue.");
          return false;
        }
        break;
      case 6:
        if (!formData.income) {
          setValidationError("Please select your family income range to continue.");
          return false;
        }
        break;
      case 7:
        if (!formData.parentJob) {
          setValidationError("Please select your parent's occupation to continue.");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    setValidationError("");
    if (step > 1) setStep(step - 1);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setValidationError(""); // clear error when user makes a selection
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    const payload = {
      name: formData.name,
      gender: formData.gender,
      state: formData.state,
      academicYear: formData.academicYear,
      category: formData.category,
      income: formData.income,
      parentJob: formData.parentJob,
      annualIncome: INCOME_MAP[formData.income] || 0,
      academic_year: ACADEMIC_YEAR_MAP[formData.academicYear] || 1,
    };
    try {
      if (isAuthenticated) {
        try { await updateStudentProfile(payload); }
        catch { await createStudentProfile(payload as any); }
      }
      navigate("/scholarships", { state: { profile: formData } });
    } catch {
      navigate("/scholarships", { state: { profile: formData } });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white">
            <h2 className="text-3xl mb-2 font-bold">Student Details</h2>
            <p className="text-white/90 mb-4">Help us find the perfect scholarships for you</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress.Root className="h-3 bg-white/20 rounded-full overflow-hidden">
                <Progress.Indicator className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
              </Progress.Root>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            {/* Validation error shown inline */}
            {validationError && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-orange-50 border border-orange-300 rounded-xl text-orange-700 text-sm font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{validationError}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl"><User className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h3 className="text-xl font-semibold">Personal Information</h3>
                    <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                      validationError && !formData.name.trim() ? "border-red-400" : "border-border focus:border-primary"
                    }`} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl"><Users className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h3 className="text-xl font-semibold">Gender</h3>
                    <p className="text-sm text-muted-foreground">Select your gender <span className="text-red-500">*</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["Male", "Female", "Other"].map((g) => (
                    <button key={g} onClick={() => updateFormData("gender", g)}
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${formData.gender === g ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-secondary/10 rounded-xl"><MapPin className="w-6 h-6 text-secondary" /></div>
                  <div>
                    <h3 className="text-xl font-semibold">Location</h3>
                    <p className="text-sm text-muted-foreground">Where are you from?</p>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium">State <span className="text-red-500">*</span></label>
                  <select value={formData.state} onChange={(e) => updateFormData("state", e.target.value)}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
                      validationError && !formData.state ? "border-red-400" : "border-border focus:border-secondary"
                    }`}>
                    <option value="">Select your state</option>
                    {["Maharashtra","Karnataka","Tamil Nadu","Delhi","Uttar Pradesh","West Bengal","Gujarat","Rajasthan","Madhya Pradesh","Bihar","Andhra Pradesh","Telangana","Kerala","Punjab","Haryana","Odisha","Assam","Jharkhand","Chhattisgarh","Uttarakhand"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-accent/10 rounded-xl"><GraduationCap className="w-6 h-6 text-accent" /></div>
                  <div>
                    <h3 className="text-xl font-semibold">Academic Details</h3>
                    <p className="text-sm text-muted-foreground">Your current education level</p>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Academic Year / Class <span className="text-red-500">*</span></label>
                  <select value={formData.academicYear} onChange={(e) => updateFormData("academicYear", e.target.value)}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
                      validationError && !formData.academicYear ? "border-red-400" : "border-border focus:border-accent"
                    }`}>
                    <option value="">Select your class/year</option>
                    {["Class 10","Class 12","1st Year College","2nd Year College","3rd Year College","4th Year College","Postgraduate"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl"><Users className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h3 className="text-xl font-semibold">Category</h3>
                    <p className="text-sm text-muted-foreground">Select your category <span className="text-red-500">*</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {["General","SC","ST","OBC","EWS","Minority"].map((cat) => (
                    <button key={cat} onClick={() => updateFormData("category", cat)}
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${formData.category === cat ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-secondary/10 rounded-xl"><Wallet className="w-6 h-6 text-secondary" /></div>
                  <div>
                    <h3 className="text-xl font-semibold">Family Income</h3>
                    <p className="text-sm text-muted-foreground">Annual family income <span className="text-red-500">*</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {["Below ₹1 Lakh","₹1-3 Lakhs","₹3-5 Lakhs","₹5-8 Lakhs","Above ₹8 Lakhs"].map((range) => (
                    <button key={range} onClick={() => updateFormData("income", range)}
                      className={`p-4 rounded-xl border-2 transition-all text-left font-medium ${formData.income === range ? "border-secondary bg-secondary/10 text-secondary" : "border-border hover:border-secondary/50"}`}>
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-accent/10 rounded-xl"><Briefcase className="w-6 h-6 text-accent" /></div>
                  <div>
                    <h3 className="text-xl font-semibold">Parent's Occupation</h3>
                    <p className="text-sm text-muted-foreground">Primary occupation <span className="text-red-500">*</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {["Government Employee","Government Teacher","Private Employee","Self-Employed","Farmer","Other"].map((job) => (
                    <button key={job} onClick={() => updateFormData("parentJob", job)}
                      className={`p-4 rounded-xl border-2 transition-all text-left font-medium ${formData.parentJob === job ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"}`}>
                      {job}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button onClick={handleBack}
                  className="flex-1 py-3 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all font-medium">
                  Back
                </button>
              )}
              <button onClick={handleNext} disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-semibold">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {step === totalSteps ? (<><CheckCircle className="w-5 h-5" />Find Scholarships</>) : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}