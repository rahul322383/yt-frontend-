
/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGithub, FaFacebook, FaArrowRight, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import API from "../../utils/axiosInstance.jsx"; // Adjust path as needed

// Validation schema for password login
const schema = z.object({
  identifier: z.string().min(3, "Enter your email or username"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginPage = ({ setUser }) => {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    resetField,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Normal login submit
  const onSubmit = async (data) => {
    if (!isMounted) return;
    
    setLoading(true);
    setError("");

    const payload = {
      username: data.identifier.includes("@") ? "" : data.identifier,
      email: data.identifier.includes("@") ? data.identifier : "",
      password: data.password,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/login`,
        payload,
        { withCredentials: true }
      );

      const { accessToken, refreshToken, user } = res.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);
      setShowPopup(true);

      setTimeout(() => {
        if (isMounted) {
          setShowPopup(false);
          navigate("/dashboard");
        }
      }, 1000);
    } catch (err) {
      if (isMounted) {
        setError(
          err.response?.data?.message || "Something went wrong. Please try again."
        );
        resetField("password");
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  // Google login success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/auth/google`,
        { token: credentialResponse.credential },
        { withCredentials: true }
      );

      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);
      setShowPopup(true);

      setTimeout(() => {
        if (isMounted) {
          setShowPopup(false);
          navigate("/dashboard");
        }
      }, 1000);
    } catch (err) {
      if (isMounted) setError("Google login failed. Try again.");
    }
  };

  // OAuth login (redirect to backend to handle flow)
  const handleOAuthLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/users/auth/${provider}`;
  };

  // === OTP Login flow ===
 const sendOtp = async () => {
  if (!otpIdentifier.trim()) {
    setOtpError("Please enter your email");
    return;
  }

  setOtpError("");
  setOtpLoading(true);

  try {
    await API.post(
      `/users/sendemail/send-otp`,
      { email: otpIdentifier }, // 🔥 key fix here
      { withCredentials: true }
    );
    if (isMounted) setOtpSent(true);
  } catch (err) {
    if (isMounted) {
      setOtpError(
        err.response?.data?.message || "Failed to send OTP. Try again."
      );
    }
  } finally {
    if (isMounted) setOtpLoading(false);
  }
};


  const verifyOtp = async () => {
    if (!otpValue.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }
    setOtpError("");
    setOtpLoading(true);

    try {
      const res = await API.post(
        `/users/sendemail/verify-otp`,
        { identifier: otpIdentifier, otp: otpValue },
        { withCredentials: true }
      );

      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);
      setShowPopup(true);

      setTimeout(() => {
        if (isMounted) {
          setShowPopup(false);
          navigate("/dashboard");
        }
      }, 1000);
    } catch (err) {
      if (isMounted) {
        setOtpError(err.response?.data?.message || "Invalid OTP. Try again.");
      }
    } finally {
      if (isMounted) setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-4 sm:p-6 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 dark:border-zinc-800/50 dark:bg-zinc-900/20 transition-all"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-white"
            >
              <path
                fillRule="evenodd"
                d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-white text-3xl font-bold text-center">Welcome Back</h2>
          <p className="text-white/60 text-center mt-2">
            Sign in to access your account
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-white/10 p-1">
            <button
              onClick={() => setLoginMode("password")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                loginMode === "password"
                  ? "bg-white text-gray-900 shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setLoginMode("otp")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                loginMode === "otp"
                  ? "bg-white text-gray-900 shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              OTP Login
            </button>
          </div>
        </div>

        {loginMode === "password" && (
          <>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
                aria-live="assertive"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="your@email.com"
                    {...register("identifier")}
                    className="w-full px-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 hover:border-white/20 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 outline-none placeholder-white/40 transition duration-200"
                    aria-invalid={errors.identifier ? "true" : "false"}
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full px-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 hover:border-white/20 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 outline-none placeholder-white/40 pr-10 transition"
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                  >
                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/30 bg-white/5 text-yellow-400 focus:ring-yellow-400"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-white/70"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition"
                  onClick={() => navigate("/forget-password")}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login In <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {loginMode === "otp" && (
          <>
            {otpError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
                aria-live="assertive"
              >
                {otpError}
              </motion.div>
            )}

            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    placeholder="your@email.com or +1234567890"
                    value={otpIdentifier}
                    onChange={(e) => setOtpIdentifier(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 hover:border-white/20 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 outline-none placeholder-white/40 transition duration-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpLoading}
                  className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {otpLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-yellow-400 hover:text-yellow-300 transition"
                    onClick={() => setLoginMode("password")}
                  >
                    Back to Password Login
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit code"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 hover:border-white/20 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 outline-none placeholder-white/40 transition duration-200 text-center tracking-widest"
                  />
                </div>
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={otpLoading}
                  className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {otpLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-yellow-400 hover:text-yellow-300 transition"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpValue("");
                      setOtpError("");
                    }}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-white/50">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleOAuthLogin("facebook")}
            className="flex items-center justify-center p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 transition-colors"
            aria-label="Login with Facebook"
          >
            <FaFacebook className="text-blue-400" size={18} />
          </button>

          <button
            onClick={() => handleOAuthLogin("github")}
            className="flex items-center justify-center p-3 rounded-xl bg-gray-800/10 hover:bg-gray-800/20 border border-gray-800/20 transition-colors"
            aria-label="Login with GitHub"
          >
            <FaGithub className="text-white" size={18} />
          </button>

          <div className="flex items-center justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed")}
              width="60"
              size="medium"
              shape="pill"
              theme="filled_blue"
              text="login_with"
            />
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-white/60">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-medium text-yellow-400 hover:text-yellow-300 transition"
          >
            Sign up
          </button>
        </div>

        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 bg-green-500/20 border border-green-500/30 text-green-200 text-sm p-3 rounded-lg text-center"
              aria-live="polite"
            >
              Login successful! Redirecting...
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPage;