/* eslint-disable no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun,
  FaGithub,
  FaGoogle,
  FaSignInAlt,
  FaUser,
  FaLock,
  FaEnvelope,
  FaImage,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import PasswordStrengthBar from "react-password-strength-bar";
import API from "../../utils/axiosInstance.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

// Updated schema to match backend validation
const schema = z.object({
  fullName: z.string()
    .min(3, "Full Name must be at least 3 characters")
    .refine((val) => !/[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{S}]/gu.test(val), {
      message: "Full name cannot contain emojis or symbols"
    }),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
});

const SignUpPage = () => {
  const { login } = useAuth(); // Use the login function from AuthContext
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, github: false });
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [signupMode, setSignupMode] = useState("normal");
  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setError: setFormError,
    clearErrors,
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    const storedMode = localStorage.getItem("darkMode");
    if (storedMode) setDarkMode(storedMode === "true");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError("Avatar must be a JPEG or PNG image");
        return;
      }
      
      // Validate file size
      if (file.size > 2 * 1024 * 1024) {
        setError("Avatar size must be under 2MB");
        return;
      }
      
      setError("");
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError("Cover image must be a JPEG or PNG image");
        return;
      }
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setError("Cover image size must be under 5MB");
        return;
      }
      
      setError("");
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const validateFiles = () => {
    if (signupMode === "normal" && !avatar) {
      return "Avatar is required.";
    }
    return null;
  };

  const nextStep = async () => {
    const isValid = await trigger(["fullName", "username", "email", "password"]);
    if (isValid) setStep(2);
  };

  const prevStep = () => setStep(1);

  const onSubmit = async (data) => {
    const fileError = validateFiles();
    if (fileError) return setError(fileError);

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => val && formData.append(key, val));
      
      if (avatar) formData.append("avatar", avatar);
      if (coverImage) formData.append("coverImage", coverImage);

      const res = await API.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      const { accessToken, refreshToken, user } = res.data?.data || {};
      
      // Use the login function from AuthContext instead of setUser
      login(user, accessToken, refreshToken);

      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Signup failed. Try again.";
      console.error("[Signup Error]", err.response?.data || err);
      setError(msg);

      // Handle duplicate field errors
      if (err?.response?.data?.message?.includes("already")) {
        if (err.response.data.message.includes("email") || err.response.data.message.includes("Email")) {
          setFormError("email", { type: "manual", message: "Email is already registered" });
        } else if (err.response.data.message.includes("username") || err.response.data.message.includes("Username")) {
          setFormError("username", { type: "manual", message: "Username is already taken" });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    setSocialLoading(prev => ({ ...prev, [provider]: true }));
    setError("");
    
    // Redirect to OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/users/auth/${provider}`;
    
    // Fallback in case redirect fails
    setTimeout(() => {
      setSocialLoading(prev => ({ ...prev, [provider]: false }));
      setError(`${provider} authentication failed. Please try again.`);
    }, 5000);
  };

  const handleNavigateToLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:to-black flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 overflow-hidden"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 1000, y: Math.random() * 1000 }}
            animate={{
              x: Math.random() * 1000,
              y: Math.random() * 1000,
              transition: { duration: Math.random() * 20 + 10, repeat: Infinity, repeatType: "reverse" }
            }}
            className="absolute w-2 h-2 rounded-full bg-white"
          />
        ))}
      </motion.div>

      {/* Theme toggle */}
      <motion.button
        onClick={() => setDarkMode(!darkMode)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-6 right-6 p-3 rounded-full text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm z-10 shadow-lg"
        aria-label="Toggle theme"
      >
        {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden relative z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-30"></div>
        
        <div className="relative p-8 md:p-10 space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-2">Join Our Community</h2>
            <p className="text-white/70">Create your account to get started</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-center flex items-center justify-center gap-2"
              >
                <FaExclamationTriangle />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showPopup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-3 bg-green-500/20 border border-green-500/30 text-green-200 text-center rounded-lg"
              >
                Account created successfully! Redirecting...
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                signupMode === "normal"
                  ? "bg-white text-gray-900 shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              onClick={() => {
                setSignupMode("normal");
                setError("");
                clearErrors();
              }}
            >
              Regular Sign Up
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                signupMode === "social"
                  ? "bg-white text-gray-900 shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              onClick={() => {
                setSignupMode("social");
                setError("");
                clearErrors();
              }}
            >
              Social Sign Up
            </motion.button>
          </div>

          {signupMode === "normal" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-white/80 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-white/50" />
                      </div>
                      <input
                        id="fullName"
                        {...register("fullName")}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-1">
                      Username *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-white/50" />
                      </div>
                      <input
                        id="username"
                        {...register("username")}
                        placeholder="johndoe123"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-white/50" />
                      </div>
                      <input
                        id="email"
                        {...register("email")}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-white/50" />
                      </div>
                      <input
                        id="password"
                        {...register("password")}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        type={passwordVisible ? "text" : "password"}
                        className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible((prev) => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition"
                      >
                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <PasswordStrengthBar 
                      password={watch("password") || ""} 
                      className="mt-2"
                      scoreWords={['Weak', 'Weak', 'Medium', 'Strong', 'Very Strong']}
                      shortScoreWord="Too short"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                    )}
                  </div>

                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Continue
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Profile Picture *
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer transition">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <FaImage className="text-white/50 mb-1" size={20} />
                            <span className="text-xs text-white/50">Upload</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                      <div className="text-sm text-white/60">
                        <p>Upload a clear photo of yourself</p>
                        <p className="text-xs">Max 2MB (JPEG/PNG)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Cover Image (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer transition">
                        {coverPreview ? (
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <FaImage className="text-white/50 mb-1" size={24} />
                            <span className="text-sm text-white/50">Upload Cover</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-70"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block"
                          >
                            <FaSpinner />
                          </motion.span>
                          Creating Account...
                        </span>
                      ) : (
                        "Complete Sign Up"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSocialSignup("google")}
                  disabled={socialLoading.google}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all disabled:opacity-50"
                >
                  {socialLoading.google ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FaSpinner />
                    </motion.span>
                  ) : (
                    <FaGoogle className="text-red-500" size={18} />
                  )}
                  Sign up with Google
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSocialSignup("github")}
                  disabled={socialLoading.github}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all disabled:opacity-50"
                >
                  {socialLoading.github ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FaSpinner />
                    </motion.span>
                  ) : (
                    <FaGithub size={18} />
                  )}
                  Sign up with GitHub
                </motion.button>
              </div>
              
              <div className="text-center text-white/60 text-sm">
                <p>You'll be redirected to the provider for authentication</p>
              </div>
            </motion.div>
          )}

          <div className="text-center pt-4">
            <button
              onClick={handleNavigateToLogin}
              className="text-sm text-white/70 hover:text-white transition flex items-center justify-center gap-2 mx-auto"
            >
              <FaSignInAlt />
              Already have an account? <span className="text-yellow-400 font-medium">Login</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;