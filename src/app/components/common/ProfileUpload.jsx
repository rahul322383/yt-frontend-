// src/components/common/CoverUpload.jsx
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import "../../../index.css"; // Adjust path as needed
import API from "../../../utils/axiosInstance.jsx"; // Adjust path as needed

export default function CoverUpload({ coverUrl, onUpload }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      setLoading(true);
      const res = await API.put("/users/update-cover", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onUpload(data.data.coverImage); // Update the cover image preview
      toast.success("Cover image updated!");
    } catch (error) {
      toast.error(error.message || "Failed to upload cover image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-zinc-700 mt-4 cursor-pointer"
      whileHover={{ scale: 1.01 }}
      onClick={() => inputRef.current?.click()}
    >
      {loading ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-zinc-800">
          <Loader2 className="animate-spin w-8 h-8 text-gray-500 dark:text-white" />
        </div>
      ) : (
        <img
          src={coverUrl || "/default-cover.jpg"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={inputRef}
        className="hidden"
      />
      <div className="absolute bottom-0 w-full text-center bg-black/50 text-white text-xs py-1">
        Change Cover
      </div>
    </motion.div>
  );
}
