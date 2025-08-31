/* eslint-disable no-unused-vars */
"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import API from "../../utils/axiosInstance"; 

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const inputsRef = useRef([]);

  // ✅ Extract email from query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [location.search]);

  // Handle OTP input
  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < OTP_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").trim().slice(0, OTP_LENGTH);
    if (new RegExp(`^\\d{${OTP_LENGTH}}$`).test(pasted)) {
      setOtp(pasted.split(""));
      inputsRef.current[OTP_LENGTH - 1]?.focus();
    }
  };

  // ✅ Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      toast.error(`Please enter the full ${OTP_LENGTH}-digit OTP`);
      setLoading(false);
      return;
    }

    try {
      const response = await API.post("/users/verify-otp", { email, otp: code });
      toast.success("✅ OTP Verified! Redirecting...");
      setTimeout(() => {
        navigate("/reset-password", { state: { email } }); // ✅ redirect to reset password page
      }, 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "❌ Invalid OTP or Email");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP
  const handleResend = async () => {
    if (!email) return toast.error("Enter email first");
    try {
      await API.post("/users/resend-otp", { email });
      toast.success("📩 OTP resent!");
      setResendTimer(60);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    }
  };

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Verify OTP
        </h2>

        <form onSubmit={handleVerify} className="space-y-5" onPaste={handlePaste}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            required
          />

          <div className="flex justify-between items-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label={`OTP digit ${i + 1}`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                ref={(el) => (inputsRef.current[i] = el)}
                onPaste={(e) => e.preventDefault()}
                disabled={loading}
                className={`w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:outline-none transition-all
                  ${digit ? "border-green-500" : "border-gray-300"}
                  focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 flex justify-center items-center gap-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-2 px-4 flex justify-center items-center gap-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Cancel
          </button>

          <div className="text-sm text-center text-gray-600 dark:text-gray-300">
            {resendTimer > 0 ? (
              <span>Resend OTP in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-green-600 hover:text-green-800"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
