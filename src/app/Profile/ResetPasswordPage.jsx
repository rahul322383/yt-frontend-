/* eslint-disable no-unused-vars */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import zxcvbn from "zxcvbn"; // ✅ strength checker
import API from "../../utils/axiosInstance";

// ✅ Schema validation
const schema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Must include uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  // ✅ Password strength handler
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    if (value) {
      setPasswordStrength(zxcvbn(value));
    } else {
      setPasswordStrength(null);
    }
  };

  // ✅ Submit handler
  const onSubmit = async (data) => {
    if (passwordStrength && passwordStrength.score < 3) {
      toast.error("⚠️ Password is too weak. Try a stronger one.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const res = await API.post(
        "/users/change-password",
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(res?.data?.message || "Password reset successfully!");
      reset();
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("❌ Backend Error:", err?.response?.data);
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        Reset Password
      </h2>

      {/* Current Password */}
      <div>
        <label className="text-gray-700 dark:text-gray-300">
          Current Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          {...register("currentPassword")}
          className="w-full p-2 border rounded-lg mt-1 dark:bg-gray-700 dark:text-white"
          placeholder="Enter current password"
        />
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label className="text-gray-700 dark:text-gray-300">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("newPassword")}
            onChange={(e) => {
              handlePasswordChange(e);
              return register("newPassword").onChange(e);
            }}
            className="w-full p-4 pr-10 border rounded-lg hover:border-gray-400 dark:bg-gray-700 dark:text-white"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
            aria-label="Toggle Password Visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.newPassword.message}
          </p>
        )}

        {/* ✅ Strength Meter */}
        {passwordStrength && (
          <div className="mt-2">
            <div className="h-2 rounded bg-gray-200 dark:bg-gray-600">
              <div
                className={`h-2 rounded transition-all ${
                  [
                    "bg-red-500",
                    "bg-orange-500",
                    "bg-yellow-500",
                    "bg-green-500",
                    "bg-green-600",
                  ][passwordStrength.score]
                }`}
                style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
              />
            </div>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
              {passwordStrength.feedback.suggestions[0] ||
                ["Very Weak", "Weak", "Fair", "Good", "Strong"][
                  passwordStrength.score
                ]}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="text-gray-700 dark:text-gray-300">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("confirmPassword")}
            className="w-full p-2 pr-10 border rounded-lg dark:bg-gray-700 dark:text-white"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
            aria-label="Toggle Password Visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" /> Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </button>
    </motion.form>
  );
};

export default ResetPassword;
