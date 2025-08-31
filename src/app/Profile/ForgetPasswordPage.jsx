"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import "../../index.css";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Pre-fill email from query param (optional)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [location.search]);

  // ✅ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/v1/users/forget-password", {
        email: email.trim(),
      });

      if (res.data.success) {
        toast.success("📧 OTP has been sent to your email!");
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(res.data.message || "❌ Failed to send OTP");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "❌ Something went wrong, try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-gray-50 dark:bg-gray-800 
                       text-gray-900 dark:text-white
                       hover:border-gray-500 focus:outline-none focus:ring-2 
                       focus:ring-yellow-400 transition duration-200"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
                       bg-yellow-400 text-white font-semibold 
                       hover:bg-yellow-500 transition duration-200 
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              "Send OTP"
            )}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have a code?{" "}
            <button
              type="button"
              onClick={() => navigate("/verify-otp")}
              className="text-yellow-500 hover:underline"
            >
              Verify OTP
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
