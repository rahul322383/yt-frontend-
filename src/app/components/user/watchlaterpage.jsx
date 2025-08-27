/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaTrash, FaShare, FaEye, FaRegClock, FaCalendarAlt, FaSun, FaMoon  } from "react-icons/fa";
import { MdSlowMotionVideo } from "react-icons/md";
import API from "../../../utils/axiosInstance.jsx";
import { useNavigate } from "react-router-dom";


const WatchLaterPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const navigate = useNavigate();

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
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const hoverTimeoutRef = useRef(null);
   
    const handleMouseEnter = () => {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
  
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        if (videoRef.current && !isShort && isVideoLoaded) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        }
      }, 300);
    };

    const handleMouseLeave = () => {
      // Clear timeout if user leaves before it triggers
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      setIsHovered(false);
      if (videoRef.current && !isShort) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };

    const handleVideoLoad = () => {
      setIsVideoLoaded(true);
    };

    useEffect(() => {
      // Clean up timeout on unmount
      return () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      };
    }, []);

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
            ? "w-[260px] sm:w-[280px] flex-shrink-0 dark:bg-gray-800 bg-amber-50 rounded-xl overflow-hidden shadow-lg"
            : "dark:bg-gray-800 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
        }`}
      >
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`block ${isShort ? "h-full" : ""}`}
        >
          <div 
            className={`relative ${isShort ? "h-[200px] sm:h-[140px]" : "aspect-video"} cursor-pointer`}
            onClick={() => navigate(`/video/${video._id}`)}
          >
            {/* Thumbnail fallback if video not loaded */}
            {!isVideoLoaded && (
              <img
                src={video.videoUrl}
                alt={video.title}
                className={`w-full h-full object-cover ${isShort ? "rounded-t-xl" : "rounded-t-xl"}`}
              />
            )}
            
            <video
        src={video?.videoUrl}
        className="absolute top-0 left-0 w-full h-full pointer-cursor object-cover"
        muted
        playsInline
        onMouseEnter={(e) => e.target.play()}
        onMouseLeave={(e) => {
          e.target.pause();
          e.target.currentTime = 0;
        }}
        onClick={() => navigate(`/video/${video._id}`)}
      />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-1 rounded-md flex items-center gap-1">
              <FaRegClock size={10} />
              {formatDuration(video.duration)}
            </div>
            
            {isShort && (
              <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
                <MdSlowMotionVideo className="text-white text-sm" />
              </div>
            )}

            {/* Play overlay for regular videos on hover */}
            {!isShort && isHovered && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-black bg-opacity-60 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className={`p-3 ${isShort ? "dark:bg-gray-800 bg-amber-50 dark:text-white text-gray-900" : "dark:bg-gray-800 bg-white dark:text-white text-gray-900"}`}>
            <div className="flex gap-3">
              {!isShort && video.owner?.avatar && (
                <img
                  src={video.owner.avatar}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold line-clamp-2 ${isShort ? "text-sm" : "text-base mb-1"} dark:text-white text-gray-900`}>
                  {video.title}
                </h3>
                
                {!isShort && (
                  <p className="text-xs dark:text-gray-400 text-gray-600 mb-1">
                    {video.owner?.username || "Unknown"}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className={`flex items-center justify-between ${isShort ? "text-xs mt-2" : "text-xs mt-1"}`}>
              <span className="dark:text-gray-400 text-gray-600 flex items-center gap-1">
                <FaCalendarAlt size={10} />
                {formatDate(video.createdAt)}
              </span>
              <span className="flex items-center gap-1 dark:text-gray-400 text-gray-600">
                <FaEye size={10} />
                {video.views?.toLocaleString() || 0}
              </span>
            </div>

            {/* Actions - Only show on hover for regular videos, always for shorts */}
            <div className={`${isShort ? "mt-2" : "mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"}`}>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove(video._id);
                    }}
                    className={`p-2 rounded-full flex items-center justify-center ${
                      isShort 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "dark:bg-gray-700 bg-gray-200 dark:text-red-400 text-red-600 hover:bg-red-600 hover:text-white"
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
                        : "dark:bg-gray-700 bg-gray-200 dark:text-blue-400 text-blue-600 hover:bg-blue-600 hover:text-white"
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
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-gray-900 bg-gray-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="dark:text-gray-400 text-gray-600">Loading your watch later videos...</p>
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-screen dark:bg-gray-900 bg-gray-100 flex flex-col items-center justify-center text-center p-6">
        <div className="dark:bg-blue-900/30 bg-blue-100 p-5 rounded-full mb-6">
          <FaClock className="text-4xl dark:text-blue-400 text-blue-600" />
        </div>
        <h2 className="text-xl font-medium dark:text-white text-gray-900 mb-3">
          Your Watch Later is empty
        </h2>
        <p className="dark:text-gray-400 text-gray-600 max-w-md mb-6">
          Save videos to watch later by clicking the clock icon when hovering over videos
        </p>
        <Link 
          to="/"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        >
          Browse Videos
        </Link>
      </div>
    );
  }

  const shorts = videos.filter(v => v.isShort);
  const regularVideos = videos.filter(v => !v.isShort);

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-100 pb-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="dark:bg-blue-900/30 bg-blue-100 p-2.5 rounded-full">
              <FaClock className="text-xl dark:text-blue-400 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold dark:text-blue-400 text-blue-600">Watch Later</h1>
            <span className="dark:bg-blue-900/30 bg-blue-100 dark:text-blue-400 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </span>
          </div>
          
         
        </div>

        {/* Shorts Section */}
        {shorts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <MdSlowMotionVideo className="text-red-500 text-xl" />
              <h2 className="text-xl font-semibold dark:text-white text-gray-900">Shorts</h2>
              <span className="dark:bg-gray-700 bg-gray-200 dark:text-gray-300 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                {shorts.length}
              </span>
            </div>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-5">Videos</h2>
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
        hideProgressBar={false}

      />
    </div>
  );
};


export default WatchLaterPage;