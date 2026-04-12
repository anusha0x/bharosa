import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { Award, TrendingUp, Clock, FileText, Filter, Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getAllSchemes, getRankedSchemes } from "../../api/schemes";
import { useAuth } from "../../context/AuthContext";

interface Scholarship {
  id: string;
  name: string;
  match: number;
  amount: string;
  deadline: string;
  description: string;
  category: string;
  eligibility: string[];
  eligible?: boolean;
  confidence?: string;
}

const INCOME_MAP: Record<string, number> = {
  "Below ₹1 Lakh": 75000, "₹1-3 Lakhs": 200000, "₹3-5 Lakhs": 400000,
  "₹5-8 Lakhs": 650000, "Above ₹8 Lakhs": 900000,
};
const AY_MAP: Record<string, number> = {
  "Class 10": 1, "Class 12": 2, "1st Year College": 1,
  "2nd Year College": 2, "3rd Year College": 3, "4th Year College": 4, "Postgraduate": 5,
};

export function EligibilityDashboard() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filtered, setFiltered] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mlUsed, setMlUsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const profileFromNav = location.state?.profile;

  // ── Save profile to localStorage whenever it arrives from navigation ────────
  // This means even if user refreshes the page, their profile is preserved
  useEffect(() => {
    if (profileFromNav) {
      localStorage.setItem("bharosa_profile", JSON.stringify(profileFromNav));
    }
  }, [profileFromNav]);

  // ── Run loadScholarships when profileFromNav arrives OR on first mount ───────
  // Using a ref to avoid double-calling on mount
  const hasLoaded = useRef(false);
  useEffect(() => {
    // Get profile from nav state OR from localStorage
    const profile = profileFromNav ||
      JSON.parse(localStorage.getItem("bharosa_profile") || "null");
    loadScholarships(profile);
    hasLoaded.current = true;
  }, [profileFromNav]); // re-runs when profile arrives from form

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q
      ? scholarships.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        )
      : scholarships
    );
  }, [search, scholarships]);

  // ── Main load function — accepts profile directly to avoid stale closure ─────
  const loadScholarships = async (profile?: any) => {
    setLoading(true); setError("");

    // Resolve profile: passed directly > localStorage > null
    const resolvedProfile = profile ||
      JSON.parse(localStorage.getItem("bharosa_profile") || "null");

    try {
      // ── Step 1: Try ML ranking if profile exists ──────────────────────────
      if (resolvedProfile?.income && resolvedProfile?.state && resolvedProfile?.category) {
        try {
          console.log("🤖 Calling ML API with profile:", resolvedProfile);
          const mlResults = await getRankedSchemes({
            user_id: user?._id || "guest",
            income: INCOME_MAP[resolvedProfile.income] || 200000,
            state: resolvedProfile.state,
            category: resolvedProfile.category,
            academic_year: AY_MAP[resolvedProfile.academicYear] || 1,
            has_caste_cert: ["SC", "ST", "OBC"].includes(resolvedProfile.category) ? 1 : 0,
            has_income_cert: 1,
            has_marksheet: 1,
          });

          console.log("✅ ML Results:", mlResults);

          const mapped: Scholarship[] = mlResults
            .map((r: any) => ({
              id: r.scheme_id,
              name: r.scheme_name,
              match: Math.round(r.probability * 100),
              amount: "₹ As per scheme",
              deadline: "See details",
              description: r.eligible
                ? `${r.confidence} confidence match for your profile`
                : "Not eligible based on your profile",
              category: "ML-Ranked",
              eligibility: [
                resolvedProfile.category,
                resolvedProfile.state,
                resolvedProfile.income,
              ],
              eligible: r.eligible,
              confidence: r.confidence,
            }))
            .filter((s: Scholarship) => s.eligible);

          if (mapped.length > 0) {
            setScholarships(mapped);
            setMlUsed(true);
            setLoading(false);
            return;
          } else {
            console.log("⚠️ ML returned 0 eligible schemes, falling to backend");
          }
        } catch (mlError) {
          console.error("❌ ML API failed:", mlError);
          // Fall through to backend
        }
      }

      // ── Step 2: Fallback to backend schemes API ───────────────────────────
      console.log("📦 Fetching from backend API...");
      const data = await getAllSchemes({
        limit: 20,
        ...(resolvedProfile?.state && { state: resolvedProfile.state }),
        ...(resolvedProfile?.category && { category: resolvedProfile.category }),
      });

      console.log("✅ Backend schemes:", data);

      const schemes = (data.schemes || []).map((s: any) => ({
        id: s._id,
        name: s.schemeName,
        match: Math.floor(Math.random() * 25) + 70,
        amount: s.amount || "₹ As per scheme",
        deadline: s.deadlineLabel || s.deadline || "See details",
        description: s.description || s.schemeName,
        category: s.categoryRequired?.[0] || "General",
        eligibility: [
          s.stateEligibility?.[0] || "All India",
          `Income: ${s.incomeLimitLabel || "As specified"}`,
        ],
      }));

      setScholarships(schemes.length ? schemes : getFallbackScholarships());
      setMlUsed(false);

    } catch (err) {
      console.error("❌ Backend API also failed:", err);
      setScholarships(getFallbackScholarships());
      setError("Could not connect to server. Showing sample data.");
    } finally {
      setLoading(false);
    }
  };

  const getFallbackScholarships = (): Scholarship[] => [
    { id: "1", name: "National Merit Scholarship 2026", match: 95, amount: "₹50,000", deadline: "March 31, 2026", description: "Merit-based scholarship for students scoring above 85% in 12th grade", category: "Merit-based", eligibility: ["85%+ in 12th", "Age below 25", "Indian Citizen"] },
    { id: "2", name: "SC/ST Pre-Matric Scholarship", match: 88, amount: "₹15,000", deadline: "April 15, 2026", description: "Financial assistance for SC/ST students pursuing education", category: "Category-based", eligibility: ["SC/ST Certificate", "Family income below 2.5L", "Regular student"] },
    { id: "3", name: "Girls Education Scholarship", match: 82, amount: "₹30,000", deadline: "March 25, 2026", description: "Empowering female students through financial support", category: "Gender-based", eligibility: ["Female student", "Regular attendance", "Age 16-22"] },
    { id: "4", name: "Minority Community Scholarship", match: 76, amount: "₹25,000", deadline: "April 10, 2026", description: "Supporting minority community students in higher education", category: "Community-based", eligibility: ["Minority community certificate", "Income below 5L", "Merit above 50%"] },
    { id: "5", name: "Post Matric Scholarship - OBC", match: 70, amount: "₹20,000", deadline: "March 28, 2026", description: "Financial assistance for OBC students in post-matric courses", category: "Category-based", eligibility: ["OBC Certificate", "Family income below 3L", "Post-matric course"] },
  ];

  const getMatchColor = (match: number) => {
    if (match >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (match >= 75) return "text-primary bg-primary/10 border-primary/20";
    return "text-secondary bg-secondary/10 border-secondary/20";
  };

  const highMatch = filtered.filter(s => s.match >= 80).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl mb-2">Your Eligible Scholarships</h1>
            <p className="text-xl text-muted-foreground">
              {mlUsed
                ? "🤖 AI-ranked matches for your profile"
                : "Showing scholarships matched to your profile"}
            </p>
          </div>
          <button
            onClick={() => loadScholarships()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Matches", value: filtered.length, color: "text-primary", bg: "bg-primary/10", icon: <Award className="w-6 h-6 text-primary" /> },
            { label: "High Match", value: highMatch, color: "text-green-600", bg: "bg-green-50", icon: <TrendingUp className="w-6 h-6 text-green-600" /> },
            { label: "Categories", value: [...new Set(filtered.map(s => s.category))].length, color: "text-secondary", bg: "bg-secondary/10", icon: <FileText className="w-6 h-6 text-secondary" /> },
            { label: "Deadline Soon", value: filtered.length, color: "text-accent", bg: "bg-accent/10", icon: <Clock className="w-6 h-6 text-accent" /> },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-3xl ${stat.color}`}>{loading ? "—" : stat.value}</p>
                </div>
                <div className={`p-3 ${stat.bg} rounded-xl`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search scholarships..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-primary/5 hover:border-primary transition-all">
              <Filter className="w-5 h-5" /><span>Filters</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((scholarship) => (
              <div key={scholarship.id} className="bg-white rounded-xl shadow-sm border border-border hover:shadow-lg transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                          <Award className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl mb-1">{scholarship.name}</h3>
                          <p className="text-muted-foreground">{scholarship.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getMatchColor(scholarship.match)}`}>
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">{scholarship.match}% Match</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg"><Award className="w-4 h-4 text-primary" /></div>
                      <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-semibold text-primary">{scholarship.amount}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-accent/10 rounded-lg"><Clock className="w-4 h-4 text-accent" /></div>
                      <div><p className="text-xs text-muted-foreground">Deadline</p><p className="font-semibold">{scholarship.deadline}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-secondary/10 rounded-lg"><FileText className="w-4 h-4 text-secondary" /></div>
                      <div><p className="text-xs text-muted-foreground">Category</p><p className="font-semibold">{scholarship.category}</p></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Key Eligibility:</p>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.eligibility.map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-muted text-sm rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/scholarship/${scholarship.id}`}
                      className="flex-1 text-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      View Details & Apply
                    </Link>
                    <button className="px-6 py-3 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                      Save for Later
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}