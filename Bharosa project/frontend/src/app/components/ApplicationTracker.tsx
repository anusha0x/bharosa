import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CheckCircle, Clock, XCircle, FileText, AlertCircle, Award, Loader2, RefreshCw } from "lucide-react";
import { getMyApplications } from "../../api/applications";
import { useAuth } from "../../context/AuthContext";

interface Stage { name: string; completed: boolean; date: string; }
interface AppItem {
  id: string; scholarshipName: string; amount: string; appliedDate: string;
  status: string; currentStage: number; stages: Stage[];
}

const STATUS_STAGE_MAP: Record<string, number> = {
  "Submitted": 1, "Under Verification": 2, "Document Review": 3, "Approved": 4, "Rejected": 4,
};
const STAGE_NAMES = ["Submitted", "Under Verification", "Document Review", "Final Decision"];

const mapApplication = (app: any): AppItem => {
  const stageIndex = STATUS_STAGE_MAP[app.status] || 1;
  return {
    id: app._id || app.applicationId,
    scholarshipName: app.schemeId?.schemeName || "Scholarship",
    amount: app.schemeId?.amount || "₹ As per scheme",
    appliedDate: new Date(app.submittedAt || app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    status: app.status?.toLowerCase().replace(/ /g, "_") || "pending",
    currentStage: stageIndex,
    stages: STAGE_NAMES.map((name, i) => ({
      name,
      completed: i < stageIndex,
      date: i < stageIndex ? (app.timeline?.[i]?.date ? new Date(app.timeline[i].date).toLocaleDateString("en-IN") : "") : "",
    })),
  };
};

const FALLBACK: AppItem[] = [
  { id: "1", scholarshipName: "National Merit Scholarship", amount: "₹50,000", appliedDate: "March 10, 2026", status: "approved", currentStage: 4, stages: [{ name: "Submitted", completed: true, date: "March 10, 2026" }, { name: "Under Verification", completed: true, date: "March 12, 2026" }, { name: "Document Review", completed: true, date: "March 14, 2026" }, { name: "Approved", completed: true, date: "March 15, 2026" }] },
  { id: "2", scholarshipName: "SC/ST Pre-Matric Scholarship", amount: "₹15,000", appliedDate: "March 12, 2026", status: "under_review", currentStage: 2, stages: [{ name: "Submitted", completed: true, date: "March 12, 2026" }, { name: "Under Verification", completed: true, date: "March 13, 2026" }, { name: "Document Review", completed: false, date: "" }, { name: "Final Decision", completed: false, date: "" }] },
];

export function ApplicationTracker() {
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => { loadApplications(); }, [isAuthenticated]);

  const loadApplications = async () => {
    setLoading(true); setError("");
    if (!isAuthenticated) { setApplications(FALLBACK); setLoading(false); return; }
    try {
      const data = await getMyApplications();
      setApplications(data.applications?.length ? data.applications.map(mapApplication) : FALLBACK);
    } catch {
      setApplications(FALLBACK);
      setError("Could not load live applications. Showing sample data.");
    } finally { setLoading(false); }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: any; label: string; cls: string }> = {
      approved: { icon: CheckCircle, label: "Approved", cls: "bg-green-50 text-green-700 border-green-200" },
      under_review: { icon: Clock, label: "Under Review", cls: "bg-blue-50 text-blue-700 border-blue-200" },
      pending: { icon: AlertCircle, label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
      rejected: { icon: XCircle, label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200" },
    };
    const cfg = configs[status] || configs.pending;
    const Icon = cfg.icon;
    return <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${cfg.cls}`}><Icon className="w-4 h-4" /><span>{cfg.label}</span></div>;
  };

  const counts = { total: applications.length, approved: applications.filter(a => a.status === "approved").length, review: applications.filter(a => a.status === "under_review").length, pending: applications.filter(a => a.status === "pending").length };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl mb-2">My Applications</h1>
            <p className="text-xl text-muted-foreground">Track the status of your scholarship applications</p>
          </div>
          <button onClick={loadApplications} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Applied", value: counts.total, color: "text-primary", bg: "bg-primary/10", icon: <FileText className="w-6 h-6 text-primary" /> },
            { label: "Approved", value: counts.approved, color: "text-green-600", bg: "bg-green-50", icon: <CheckCircle className="w-6 h-6 text-green-600" /> },
            { label: "Under Review", value: counts.review, color: "text-blue-600", bg: "bg-blue-50", icon: <Clock className="w-6 h-6 text-blue-600" /> },
            { label: "Pending", value: counts.pending, color: "text-amber-600", bg: "bg-amber-50", icon: <AlertCircle className="w-6 h-6 text-amber-600" /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                  <p className={`text-3xl ${s.color}`}>{loading ? "—" : s.value}</p>
                </div>
                <div className={`p-3 ${s.bg} rounded-xl`}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl"><Award className="w-6 h-6 text-primary" /></div>
                      <div>
                        <h3 className="text-xl mb-1">{app.scholarshipName}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>Amount: <span className="text-primary">{app.amount}</span></span>
                          <span>•</span>
                          <span>Applied on: {app.appliedDate}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="mb-6">
                    <h4 className="mb-4 text-sm text-muted-foreground">Application Progress</h4>
                    <div className="relative">
                      <div className="absolute top-5 left-5 right-5 h-1 bg-muted">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${(app.currentStage / app.stages.length) * 100}%` }}></div>
                      </div>
                      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
                        {app.stages.map((stage, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 z-10 ${stage.completed ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg" : "bg-white border-2 border-muted text-muted-foreground"}`}>
                              {stage.completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm">{idx + 1}</span>}
                            </div>
                            <div className="text-center">
                              <p className={`text-sm mb-1 ${stage.completed ? "text-foreground" : "text-muted-foreground"}`}>{stage.name}</p>
                              {stage.date && <p className="text-xs text-muted-foreground">{stage.date}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link to={`/scholarship/${app.id}`}
                      className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all">
                      View Details
                    </Link>
                    {app.status === "approved" && (
                      <button className="px-6 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-all">
                        Download Certificate
                      </button>
                    )}
                    {app.status === "under_review" && (
                      <Link to="/documents" className="px-6 py-2 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                        Upload Additional Documents
                      </Link>
                    )}
                    <button className="px-6 py-2 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-border">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4"><FileText className="w-10 h-10 text-primary" /></div>
                <h3 className="text-2xl mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-6">Start applying for scholarships to track them here</p>
                <Link to="/scholarships" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all">
                  Browse Scholarships
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
