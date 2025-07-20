"use client";
import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import API from "../../../utils/axiosInstance.jsx"; // ✅ make sure this is axios instance with baseURL

export default function AvatarUpload({ avatarUrl, onUpload }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, or WebP images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file); // field name must match multer

    try {
      setLoading(true);

      const res = await API.put("/users/update-avatar", formData, {

        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const { success, data, message } = res.data;

      if (!success || !data?.avatar) {
        throw new Error(message || "Upload failed");
      }

      const updatedAvatar = `${data.avatar}?t=${Date.now()}`; // prevent cache
      toast.success("Avatar updated successfully!");
      onUpload?.(updatedAvatar);
    } catch (err) {
      const { response } = err;
      const msg =
        response?.data?.message ||
        (response?.status === 401
          ? "Session expired. Login again."
          : "Something went wrong");

      toast.error(msg);

      if (response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
      inputRef.current.value = "";
    }
  }, [onUpload]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!loading && inputRef.current) {
      inputRef.current.click();
    }
  }, [loading]);

  return (
    <motion.div
      className={`relative w-32 h-32 rounded-full overflow-hidden border-2 cursor-pointer transition ${
        isDragging
          ? "border-green-500 bg-green-100 dark:bg-zinc-700"
          : loading
          ? "border-blue-400 animate-pulse"
          : "border-gray-300 dark:border-zinc-700"
      }`}
      whileHover={!loading ? { scale: 1.03 } : {}}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      tabIndex={0}
      role="button"
    >
      {loading ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-zinc-800">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600 dark:text-white" />
        </div>
      ) : (
        <>
          <img
            src={avatarUrl || "/default-avatar.png"}
            alt="User Avatar"
            className="w-full h-full object-cover"
            draggable={false}
            loading="lazy"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity" />
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />

      <div className="absolute bottom-0 w-full text-center bg-black/50 text-white text-xs py-1 pointer-events-none">
        {isDragging ? "Drop to upload" : "Change avatar"}
      </div>
    </motion.div>
  );
}
