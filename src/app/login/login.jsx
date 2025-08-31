
/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGithub, FaFacebook, FaArrowRight, FaSpinner, FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import API from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Cookies from "js-cookie";

// Validation schemas
const passwordSchema = z.object({
  identifier: z.string().min(3, "Enter your email or username"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const otpSchema = z.object({
  identifier: z.string().email("Please enter a valid email address"),
});

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [isMounted, setIsMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRefs = useRef([]);
  const timerRef = useRef(null);

  const navigate = useNavigate();
  const { auth, setAuth, clearAuthData } = useAuth();

  
  const resolver = useMemo(
  () => zodResolver(loginMode === "password" ? passwordSchema : otpSchema),
  [loginMode]
);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    resetField,
    watch,
    setValue,
    trigger
  } = useForm({
    resolver: zodResolver(loginMode === "password" ? passwordSchema : otpSchema),
    mode: "onChange",
  });

  const identifierValue = watch("identifier");

  useEffect(() => {
    setIsMounted(true);
    
    if (auth.isAuthenticated) {
      navigate("/dashboard");
    }
    
    return () => {
      setIsMounted(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [auth.isAuthenticated, navigate]);

  // Start resend timer when OTP is sent
  useEffect(() => {
    if (otpSent && resendTimer === 0) {
      setResendTimer(30);
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [otpSent]);

  // Focus on first OTP input when OTP is sent
  useEffect(() => {
    if (otpSent && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpSent]);

  // Handle OTP input change
  const handleOtpChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);
    
    // Auto-focus to next input if current input has value
    if (value && index < 5) {
      setTimeout(() => {
        otpInputRefs.current[index + 1]?.focus();
      }, 10);
    }
    
    // Auto-submit if all digits are filled
    if (newOtp.every(digit => digit !== "") && index === 5) {
      verifyOtp();
    }
  }, [otpValue]);

  // Handle OTP input key down
  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValue[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        e.preventDefault();
        setTimeout(() => {
          otpInputRefs.current[index - 1]?.focus();
        }, 10);
      } else if (otpValue[index]) {
        // Clear current input and stay there
        e.preventDefault();
        const newOtp = [...otpValue];
        newOtp[index] = "";
        setOtpValue(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move left with arrow key
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Move right with arrow key
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      // Submit on Enter key
      e.preventDefault();
      verifyOtp();
    }
  }, [otpValue]);

  // Handle paste event
  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, ''); // Remove non-digits
    
    if (pastedData.length >= 6) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtpValue(newOtp);
      
      // Focus on the last input after paste
      setTimeout(() => {
        otpInputRefs.current[5]?.focus();
      }, 10);
    }
  }, []);

  // Handle OTP input focus
  const handleOtpFocus = useCallback((e) => {
    // Select the text when focused for easy replacement
    setTimeout(() => {
      e.target.select();
    }, 10);
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
      const res = await API.post(
        `/users/login`,
        payload,
        { withCredentials: true }
      );

      const { accessToken, refreshToken, user } = res.data.data;

      // Set tokens based on rememberMe choice
      if (rememberMe) {
        Cookies.set("accessToken", accessToken, { expires: 30 }); // Expires in 30 days
      } else {
        localStorage.setItem("accessToken", accessToken);
      }
      localStorage.setItem("refreshToken", refreshToken);

      // Update auth state
      setAuth({
        user: user,
        isAuthenticated: true,
        loading: false
      });

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
      const res = await API.post(
        `/users/auth/google`,
        { token: credentialResponse.credential },
        { withCredentials: true }
      );

      const { accessToken, refreshToken, user } = res.data.data;
      
      // Set tokens based on rememberMe choice
      if (rememberMe) {
        Cookies.set("accessToken", accessToken, { expires: 30 });
      } else {
        localStorage.setItem("accessToken", accessToken);
      }
      localStorage.setItem("refreshToken", refreshToken);

      // Update auth state
      setAuth({
        user: user,
        isAuthenticated: true,
        loading: false
      });

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
    if (!identifierValue || !isValid) {
      setOtpError("Please enter a valid email");
      return;
    }

    setOtpError("");
    setOtpLoading(true);

    try {
      await API.post(
        `/users/sendemail/send-otp`,
        { email: identifierValue }
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
    const otpString = otpValue.join('');
    if (!otpString.trim() || otpString.length !== 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }
    setOtpError("");
    setOtpLoading(true);

    try {
      const res = await API.post(
        `/users/sendemail/verify-otp`,
        { identifier: identifierValue, otp: otpString }
      );

      const { accessToken, refreshToken, user } = res.data.data;
      
      // Set tokens based on rememberMe choice
      if (rememberMe) {
        Cookies.set("accessToken", accessToken, { expires: 30 });
      } else {
        localStorage.setItem("accessToken", accessToken);
      }
      localStorage.setItem("refreshToken", refreshToken);

      // Update auth state
      setAuth({
        user: user,
        isAuthenticated: true,
        loading: false
      });

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

  // Resend OTP
const resendOtp = () => {
  if (resendTimer > 0) return;
  setOtpValue(["", "", "", "", "", ""]);
  setOtpError("");
  sendOtp();
};


  // Switch login mode
  const switchLoginMode = (mode) => {
    setLoginMode(mode);
    setError("");
    setOtpError("");
    setOtpSent(false);
    setOtpValue(["", "", "", "", "", ""]);
  };






  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-4 sm:p-6 transition-all duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 dark:border-zinc-800/50 dark:bg-zinc-900/20 transition-all hover:shadow-lg hover:shadow-purple-500/10"
      >
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <motion.div 
            className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 sm:w-8 sm:h-8 text-white"
            >
              <path
                fillRule="evenodd"
                d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            Welcome Back
          </h2>
          <p className="text-white/60 text-center mt-1 sm:mt-2 text-sm sm:text-base">
            Sign in to access your account
          </p>
        </div>

        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="inline-flex rounded-lg bg-white/10 p-1 backdrop-blur-sm">
            <button
              onClick={() => switchLoginMode("password")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 ${
                loginMode === "password"
                  ? "bg-white text-gray-900 shadow"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <FaLock className="text-xs sm:text-sm" />
              Password
            </button>
            <button
              onClick={() => switchLoginMode("otp")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 ${
                loginMode === "otp"
                  ? "bg-white text-gray-900 shadow"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <FaShieldAlt className="text-xs sm:text-sm" />
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
                className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-xs sm:text-sm"
                aria-live="assertive"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-white/40 text-xs sm:text-sm" />
                  </div>
                  <input
                    type="text"
                    placeholder="your@email.com or username"
                    autoComplete="username"
                    {...register("identifier")}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/5 text-white rounded-xl border border-white/10 hover:border-white/20 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none placeholder-white/40 transition-all duration-200 text-xs sm:text-sm"
                    aria-invalid={errors.identifier ? "true" : "false"}
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1 text-xs sm:text-sm text-red-400">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-white/40 text-xs sm:text-sm" />
                  </div>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 bg-white/5 text-white rounded-xl border border-white/10 hover:border-white/20 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none placeholder-white/40 transition-all duration-200 text-xs sm:text-sm"
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-all duration-200 p-1"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                  >
                    {passwordVisible ? <FaEyeSlash size={12} className="sm:w-3.5 sm:h-3.5" /> : <FaEye size={12} className="sm:w-3.5 sm:h-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs sm:text-sm text-red-400">
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
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-white/30 bg-white/5 text-yellow-400 focus:ring-2 focus:ring-yellow-400/30 cursor-pointer transition-all"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-xs sm:text-sm text-white/70 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>
                <button
                    type="button"
                    className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 transition-all duration-200"
                    onClick={() => navigate("/forget-password")}
                  >
                    Forgot password?
                  </button>
              </div>

              <motion.button
                type="submit"
                disabled={!isValid || loading}
                className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group text-xs sm:text-sm"
                whileHover={{ scale: !isValid || loading ? 1 : 1.02 }}
                whileTap={{ scale: !isValid || loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-1.5 sm:mr-2 text-xs sm:text-sm" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login In <FaArrowRight className="ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform text-xs sm:text-sm" />
                  </>
                )}
              </motion.button>
            </form>
          </>
        )}

        {loginMode === "otp" && (
          <>
            {otpError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-xs sm:text-sm"
                aria-live="assertive"
              >
                {otpError}
              </motion.div>
            )}

            {!otpSent ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-white/40 text-xs sm:text-sm" />
                    </div>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      {...register("identifier")}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/5 text-white rounded-xl border border-white/10 hover:border-white/20 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none placeholder-white/40 transition-all duration-200 text-xs sm:text-sm"
                    />
                  </div>
                  {errors.identifier && (
                    <p className="mt-1 text-xs sm:text-sm text-red-400">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpLoading || !isValid}
                  className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group text-xs sm:text-sm"
                  whileHover={{ scale: otpLoading || !isValid ? 1 : 1.02 }}
                  whileTap={{ scale: otpLoading || !isValid ? 1 : 0.98 }}
                >
                  {otpLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-1.5 sm:mr-2 text-xs sm:text-sm" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP <FaArrowRight className="ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform text-xs sm:text-sm" />
                    </>
                  )}
                </motion.button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 transition-all duration-200"
                    onClick={() => switchLoginMode("password")}
                  >
                    Back to Password Login
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/80 text-xs sm:text-sm">
                    We sent a 6-digit code to <span className="text-yellow-400 font-medium">{identifierValue}</span>
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2 sm:mb-3 text-center">
                    Enter Verification Code
                  </label>
                  <div 
                    className="flex justify-center space-x-2 sm:space-x-3"
                    onPaste={handleOtpPaste}
                  >
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={otpValue[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onFocus={handleOtpFocus}
                        className="w-14 h-14 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-semibold bg-white/10 border border-white/20 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200 text-white"
                        autoComplete="one-time-code"
                        aria-label={`Digit ${index + 1} of 6`}
                      />
                    ))}
                  </div>
                </div>
                
                <motion.button
                  type="button"
                  onClick={verifyOtp}
                  disabled={otpLoading || otpValue.join('').length !== 6}
                  className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group text-xs sm:text-sm"
                  whileHover={{ scale: otpLoading || otpValue.join('').length !== 6 ? 1 : 1.02 }}
                  whileTap={{ scale: otpLoading || otpValue.join('').length !== 6 ? 1 : 0.98 }}
                >
                  {otpLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-1.5 sm:mr-2 text-xs sm:text-sm" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </motion.button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={resendTimer > 0}
                    className={`text-xs sm:text-sm transition-all duration-200 ${
                      resendTimer > 0 
                        ? "text-white/40 cursor-not-allowed" 
                        : "text-yellow-400 hover:text-yellow-300"
                    }`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="relative my-4 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-2 bg-transparent text-white/50">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <motion.button
            onClick={() => handleOAuthLogin("facebook")}
            className="flex items-center justify-center p-2 sm:p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 transition-colors"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Login with Facebook"
          >
            <FaFacebook className="text-blue-400 text-sm sm:text-base" />
          </motion.button>

          <motion.button
            onClick={() => handleOAuthLogin("github")}
            className="flex items-center justify-center p-2 sm:p-3 rounded-xl bg-gray-800/10 hover:bg-gray-800/20 border border-gray-800/20 transition-colors"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Login with GitHub"
          >
            <FaGithub className="text-white text-sm sm:text-base" />
          </motion.button>

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

        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-white/60">
          Don't have an account?{" "}
          <motion.button
            onClick={() => navigate("/signup")}
            className="font-medium text-yellow-400 hover:text-yellow-300 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign up
          </motion.button>
        </div>

        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 sm:mt-6 bg-green-500/20 border border-green-500/30 text-green-200 text-xs sm:text-sm p-2 sm:p-3 rounded-lg text-center"
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