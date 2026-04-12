import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckCircle, Shield, FileText, Upload } from "lucide-react";

export default function DigiLockerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setVerified(true);

      setTimeout(() => {
        navigate("/student-details");
      }, 1500);
    }, 2000);
  };

  const documents = [
    "Aadhaar Card",
    "Income Certificate",
    "Caste Certificate",
    "Education Certificate",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="max-w-3xl w-full">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            DigiLocker Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Securely verify your documents in seconds
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md border rounded-3xl shadow-xl p-8"
        >
          <div className="text-center">

            {/* Icon */}
            <motion.div
              animate={loading ? { rotate: 360 } : {}}
              transition={{ repeat: loading ? Infinity : 0, duration: 1 }}
              className="mb-6 flex justify-center"
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
                {verified ? (
                  <CheckCircle className="w-14 h-14 text-white" />
                ) : (
                  <Shield className="w-14 h-14 text-white" />
                )}
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-2">
              {verified ? "Successfully Verified!" : "Connect DigiLocker"}
            </h2>

            <p className="text-gray-600 mb-6">
              {verified
                ? "Your documents have been verified successfully"
                : "Fetch and verify documents securely from DigiLocker"}
            </p>

            {/* Button */}
            {!verified && (
              <button
                onClick={handleVerify}
                disabled={loading}
                className="px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-lg transition flex items-center justify-center gap-2 mx-auto"
              >
                {loading ? "Connecting..." : "Connect DigiLocker"}
              </button>
            )}
          </div>

          {/* Documents */}
          {verified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-3"
            >
              {documents.map((doc, i) => (
                <motion.div
                  key={doc}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-green-600" />
                    <span>{doc}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Verified</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Bottom Info */}
        <div className="grid grid-cols-3 gap-4 mt-6 text-center text-sm">
          <div className="bg-white/60 p-3 rounded-xl">🔒 Secure</div>
          <div className="bg-white/60 p-3 rounded-xl">✔ Verified</div>
          <div className="bg-white/60 p-3 rounded-xl">⚡ Instant</div>
        </div>
      </div>
    </div>
  );
}