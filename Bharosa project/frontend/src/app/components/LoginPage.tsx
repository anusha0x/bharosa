import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Phone, User, Lock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { sendOTP, verifyOTP } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) { setError("Please enter a valid 10-digit mobile number"); return; }
    setLoading(true); setError("");
    try {
      const data = await sendOTP(phone);
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setError("Please enter the 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      const data = await verifyOTP(phone, otp);
      login(data.token, data.user);
      navigate("/digilocker");
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl mb-2 font-bold">Welcome Back</h2>
            <p className="text-muted-foreground">Login to access your scholarship dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          {devOtp && (
            <div className="p-3 mb-4 bg-yellow-50 border border-yellow-300 rounded-xl text-yellow-800 text-sm font-medium">
              <strong>Dev OTP:</strong> {devOtp}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter your 10-digit mobile number"
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    maxLength={10} required />
                </div>
              </div>
              <div className="flex items-start gap-2 p-4 bg-primary/5 rounded-xl">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">Your phone number is secure and will be used for OTP verification only</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-semibold">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Don't have an account?{" "}
                  <Link to="/student-details" className="text-primary hover:underline font-medium">Register Now</Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Enter OTP</label>
                <p className="text-sm text-muted-foreground mb-4">We've sent a 6-digit code to {phone}</p>
                {/* OTP boxes with visible styling */}
                <div className="flex justify-center">
                  <div className="flex gap-2">
                    {[0,1,2,3,4,5].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        value={otp[i] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const newOtp = otp.split("");
                          newOtp[i] = val;
                          setOtp(newOtp.join(""));
                          // Auto-focus next
                          if (val && i < 5) {
                            const next = document.getElementById(`otp-${i+1}`);
                            next?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            const prev = document.getElementById(`otp-${i-1}`);
                            prev?.focus();
                          }
                        }}
                        id={`otp-${i}`}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-gray-900 shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-4 bg-secondary/5 rounded-xl">
                <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">OTP is valid for 5 minutes</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-semibold">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <div className="text-center space-y-2">
                <button type="button" onClick={() => { setStep("phone"); setError(""); setDevOtp(null); setOtp(""); }}
                  className="text-sm text-muted-foreground hover:text-primary">Change Phone Number</button>
                <br />
                <button type="button" onClick={handleSendOTP} disabled={loading}
                  className="text-sm text-primary hover:underline disabled:opacity-50">Resend OTP</button>
              </div>
            </form>
          )}

          {/* Continue with Google */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-4">Or login with</p>
            <button className="w-full py-3 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}