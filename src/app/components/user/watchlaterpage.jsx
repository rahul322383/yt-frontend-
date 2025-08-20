/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaTrash, FaShare, FaEye, FaRegClock } from "react-icons/fa";
import { MdSlowMotionVideo } from "react-icons/md";
import API from "../../../utils/axiosInstance.jsx";

const WatchLaterPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const fetchWatchLater = async () => {
    try {
      const res = await API.get("/users/watch-later");
      setVideos(res?.data?.data?.videos || []);
    } catch (err) {
      console.error("Failed to fetch Watch Later videos:", err);
      toast.error("Failed to load Watch Later list.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchLater = async (videoId) => {
    try {
      await API.delete(`/users/watch-later/${videoId}`);
      toast.success("Removed from Watch Later");
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      console.error("Failed to remove video from Watch Later:", err);
      toast.error("Error removing video");
    }
  };

  useEffect(() => {
    fetchWatchLater();
  }, []);

  const VideoCard = ({ video, onRemove, isShort = false }) => {
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
   
    const handleMouseEnter = () => {
      setIsHovered(true);
      if (videoRef.current && !isShort) {
        videoRef.current.muted = true;
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (videoRef.current && !isShort) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };

    const formatDuration = (duration) => {
      if (!duration) return "N/A";
      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) return "Today";
      if (diffDays < 2) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString();
    };

    return (
      <div
        className={`group relative ${
          isShort
            ? "w-[160px] sm:w-[180px] flex-shrink-0 bg-black rounded-xl overflow-hidden shadow-lg"
            : "bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
        }`}
      >
        <Link
          to={`/video/${video._id}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`block ${isShort ? "h-full" : ""}`}
        >
          <div className={`relative ${isShort ? "h-[200px] sm:h-[140px]" : "aspect-video"}`}>
            <video
              ref={videoRef}
              src={video.videoUrl}
              className={`w-full h-full  ${isShort ? "rounded-t-xl" : "rounded-t-xl"}`}
              preload="metadata"
              playsInline
              muted
              loop={isShort}
              poster={video.thumbnailUrl}
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-1 rounded-md flex items-center gap-1">
              <FaRegClock size={10} />
              {formatDuration(video.duration)}
            </div>
            
            {isShort && (
              <div className="absolute top-2 right-2">
                <MdSlowMotionVideo className="text-white text-xl" />
              </div>
            )}
          </div>

          <div className={`p-1 ${isShort ? "bg-black text-white pb-4" : ""}`}>
            <div className="flex gap-3">
              {!isShort && video.owner?.avatar && (
                <img
                  src={video.owner.avatar}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold line-clamp-2 ${isShort ? "text-sm" : "text-base mb-1"}`}>
                  {video.title}
                </h3>
                
                {!isShort && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {video.owner?.username || "Unknown"}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className={`flex items-center justify-between ${isShort ? "text-xs mt-2" : "text-xs mt-3"}`}>
              <span className="text-gray-500 dark:text-gray-400">
                {formatDate(video.createdAt)}
              </span>
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <FaEye size={10} />
                {video.views?.toLocaleString() || 0}
              </span>
            </div>

            {/* Actions - Only show on hover for regular videos, always for shorts */}
            <div className={`${isShort ? "mt-1" : "mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"}`}>
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove(video._id);
                    }}
                    className={`p-2 rounded-full flex items-center justify-center ${
                      isShort 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                    } transition-colors`}
                    title="Remove from Watch Later"
                  >
                    <FaTrash size={12} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigator.clipboard.writeText(
                        `${window.location.origin}/video/${video._id}`
                      );
                      toast.success("Link copied!");
                    }}
                    className={`p-2 rounded-full flex items-center justify-center ${
                      isShort 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
                    } transition-colors`}
                    title="Share video"
                  >
                    <FaShare size={12} />
                  </button>
                </div>
                
                {isShort && (
                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                    Short
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your watch later videos...</p>
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-6">
        <div className="bg-blue-100 dark:bg-blue-900/20 p-5 rounded-full mb-6">
          <FaClock className="text-4xl text-blue-500" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
          Your Watch Later is empty
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
          Save videos to watch later by clicking the clock icon when hovering over videos
        </p>
        <Link 
          to="/"
          className="px-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        >
          Browse Videos
        </Link>
      </div>
    );
  }

  const shorts = videos.filter(v => v.isShort);
  const regularVideos = videos.filter(v => !v.isShort);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-full">
            <FaClock className="text-xl text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watch Later</h1>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium px-3 py-1 rounded-full">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </span>
        </div>

        {/* Shorts Section */}
        {shorts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <MdSlowMotionVideo className="text-red-500 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shorts</h2>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                {shorts.length}
              </span>
            </div>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {shorts.map((video) => (
                  <VideoCard 
                    key={video._id} 
                    video={video} 
                    onRemove={removeFromWatchLater} 
                    isShort={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Regular Videos Section */}
        {regularVideos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Videos</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {regularVideos.map((video) => (
                <VideoCard 
                  key={video._id} 
                  video={video} 
                  onRemove={removeFromWatchLater} 
                  isShort={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ToastContainer 
        position="bottom-right" 
        autoClose={2000}
        theme="colored"
        toastStyle={{
          backgroundColor: '#1f2937',
          color: '#f3f4f6'
        }}
      />
    </div>
  );
};

export default WatchLaterPage;