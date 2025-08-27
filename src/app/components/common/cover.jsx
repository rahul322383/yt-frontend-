/* eslint-disable no-unused-vars */
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, UploadCloud, X } from "lucide-react";
import API from "../../../utils/axiosInstance.jsx";

export default function CoverUpload({
  coverUrl,
  onUpload,
  className = "",
  aspectRatio = "16/9",
  maxSizeMB = 5,
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (file) => {
    if (!file || loading) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WEBP)");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      setLoading(true);
      const response = await API.put("/users/update-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to upload cover");
      }

      onUpload(response.data?.data?.coverImage);
      toast.success("Cover image updated successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload cover image");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    handleFileChange(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const response = await API.delete("/users/cover-delete");
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to remove cover");
      }
      onUpload(null);
      toast.success("Cover image removed successfully!");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error(error.message || "Failed to remove cover image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative group w-full ${className}`}>
      <motion.div
        className={`overflow-hidden rounded-lg border-2 border-dashed 
          ${dragActive ? "border-primary bg-primary/10" : "border-muted"}
          cursor-pointer transition-colors duration-200`}
        style={{ aspectRatio }}
        whileHover={{ scale: 1.01 }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-muted gap-3 p-6">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
            <p className="text-sm text-muted-foreground">
              {coverUrl ? "Updating..." : "Uploading..."}
            </p>
          </div>
        ) : coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                if (e.target.src !== "/default-cover.jpg") {
                  e.target.src = "/default-cover.jpg";
                }
              }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 text-sm bg-white/90 hover:bg-white text-black rounded-md flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <UploadCloud className="w-4 h-4" />
                  Change
                </button>
                <button
                  className="px-3 py-1 text-sm bg-destructive text-white rounded-md flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-muted gap-3 p-6 text-center">
            <UploadCloud className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop an image or click to upload
            </p>
            <p className="text-xs text-muted-foreground/70">
              Recommended: 1600x900px (Max {maxSizeMB}MB)
            </p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          ref={inputRef}
          className="hidden"
        />
      </motion.div>

      {dragActive && (
        <div className="absolute inset-0 border-4 border-dashed border-primary rounded-lg pointer-events-none flex items-center justify-center bg-primary/10 backdrop-blur-sm">
          <div className="text-center p-4 bg-background rounded-lg shadow-lg border">
            <UploadCloud className="w-10 h-10 mx-auto text-primary mb-2" />
            <p className="font-medium">Drop image to upload</p>
            <p className="text-sm text-muted-foreground mt-1">
              JPEG, PNG or WEBP (max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
