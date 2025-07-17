import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import "../../../index.css"; // Adjust path as needed
import API from "../../../utils/axiosInstance.jsx"; // Adjust path as needed
export default function AvatarUpload({ avatarUrl, onUpload }) {
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      const res = await API.put("/users/update-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await res.json().catch(() => {
        throw new Error("Invalid JSON from server");
      });

      if (!res.ok || !data?.success) {
        if (res.status === 401) {
          toast.error("Session expired. Logging out...");
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
        throw new Error(data?.message || "Upload failed");
      }

      const updatedAvatar = `${data.data?.avatar}?t=${Date.now()}`;
      onUpload?.(updatedAvatar);
      toast.success("Avatar updated successfully!");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      inputRef.current.value = ""; // allow re-upload of same file
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      ref={dropRef}
      className={`relative w-32 h-32 rounded-full overflow-hidden border-2 transition cursor-pointer ${
        isDragging
          ? "border-green-500 bg-green-100 dark:bg-zinc-700"
          : loading
          ? "border-blue-400 animate-pulse"
          : "border-gray-300 dark:border-zinc-700"
      }`}
      whileHover={!loading ? { scale: 1.03 } : {}}
      onClick={() => {
        if (!loading) inputRef.current?.click();
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      aria-label="Upload Avatar"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !loading) inputRef.current?.click();
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-zinc-800">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600 dark:text-white" />
        </div>
      ) : (
        <img
          src={avatarUrl || "/default-avatar.png"}
          alt="User Avatar"
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      )}

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="absolute bottom-0 w-full text-center bg-black/50 text-white text-xs py-1 pointer-events-none">
        {isDragging ? "Drop to upload" : "Change Avatar"}
      </div>
    </motion.div>
  );
}
