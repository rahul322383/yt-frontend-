

"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import API from "../../../utils/axiosInstance.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";

const VideoUpload = ({ playlistId, onClose, refreshPlaylist }) => {
  const { auth, clearAuthData } = useAuth();

  const [uploadData, setUploadData] = useState({ title: "", videoRef: "", videoFile: null });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cancelTokenSource, setCancelTokenSource] = useState(null);

  const handleUploadChange = (e) => {
    setUploadData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast.error("File size must be less than 500MB");
        return;
      }
      
      // Validate file type
      const validVideoTypes = ["video/mp4", "video/mov", "video/avi", "video/webm", "video/mkv"];
      if (!validVideoTypes.includes(file.type)) {
        toast.error("Please select a valid video file (MP4, MOV, AVI, WEBM, MKV)");
        return;
      }
      
      setUploadData((prev) => ({ ...prev, videoFile: file }));
    }
  };

  const cancelUpload = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Upload canceled by user.");
      toast("Upload canceled.");
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();

    if (!auth.isAuthenticated) {
      toast.error("Please login to upload videos");
      return;
    }

    const { title, videoRef, videoFile } = uploadData;
    if (!title || !videoFile) return toast.error("Please fill all required fields");

    const form = new FormData();
    form.append("title", title);
    form.append("video", videoFile);
    if (videoRef) form.append("videoRef", videoRef);

    const source = axios.CancelToken.source();
    setCancelTokenSource(source);
    setUploading(true);
    setUploadProgress(0);

    try {
      await API.post(`/users/playlist/${playlistId}/videos`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.token}`,
        },
        cancelToken: source.token,
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        },
      });

      toast.success("Video added successfully!");
      refreshPlaylist();
      setUploadData({ title: "", videoFile: null, videoRef: "" });
      onClose();
    } catch (err) {
      if (axios.isCancel(err)) {
        toast.info("Video upload was canceled.");
      } else if (err.response?.status === 401) {
        clearAuthData();
        toast.error("Session expired, please login again");
      } else if (err.response?.status === 413) {
        toast.error("File is too large. Please choose a smaller file.");
      } else {
        toast.error(err?.response?.data?.message || "Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-200 p-1.5 rounded-full hover:bg-gray-200/80 dark:hover:bg-gray-700/80"
          aria-label="Close upload dialog"
          disabled={uploading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Upload New Video
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add a video to your playlist
          </p>
        </div>

        <form onSubmit={handleUploadVideo} className="space-y-5">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              placeholder="Enter video title"
              value={uploadData.title}
              onChange={handleUploadChange}
              required
              className="w-full p-3.5 rounded-xl border border-gray-300/80 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500/60 focus:border-transparent dark:bg-gray-800/60 dark:text-white transition-all duration-200 shadow-sm"
              disabled={uploading}
            />
          </div>
          
          {/* Video Reference Input */}
          <div>
            <label htmlFor="videoRef" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Reference (Optional)
            </label>
            <input
              id="videoRef"
              name="videoRef"
              placeholder="Video reference URL or ID"
              value={uploadData.videoRef}
              onChange={handleUploadChange}
              className="w-full p-3.5 rounded-xl border border-gray-300/80 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500/60 focus:border-transparent dark:bg-gray-800/60 dark:text-white transition-all duration-200 shadow-sm"
              disabled={uploading}
            />
          </div>
          
          {/* File Input */}
          <div>
            <label htmlFor="videoFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video File <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="videoFile"
                type="file"
                accept="video/mp4,video/mov,video/avi,video/webm,video/mkv"
                onChange={handleVideoFileChange}
                required
                className="w-full p-3.5 rounded-xl border border-gray-300/80 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500/60 focus:border-transparent dark:bg-gray-800/60 dark:text-white file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/40 dark:file:text-blue-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm"
                disabled={uploading}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Supported formats: MP4, MOV, AVI, WEBM, MKV. Max size: 500MB
            </p>
            
            {/* Selected file indicator */}
            {uploadData.videoFile && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                <p className="text-sm text-green-700 dark:text-green-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="truncate">Selected: {uploadData.videoFile.name}</span>
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  {Math.round(uploadData.videoFile.size / 1024 / 1024)} MB
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-4 pt-2">
              <div className="overflow-hidden w-full bg-gray-200/80 dark:bg-gray-700/60 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploading... {uploadProgress}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Please wait
                </span>
              </div>
              
              <button
                type="button"
                onClick={cancelUpload}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-xl shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Upload
              </button>
            </div>
          )}

          {/* Upload Button */}
          {!uploading && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={!uploadData.title || !uploadData.videoFile}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Video
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;