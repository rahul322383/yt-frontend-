

"use client";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaTrash, FaShare, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import API from "../../../utils/axiosInstance.jsx";

const WatchLaterPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const VideoCard = ({ video, onRemove }) => {
    const videoRef = useRef(null);
    const isShort = video?.isShort;
   
    const handleMouseEnter = () => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      }
    };

    const handleMouseLeave = () => {
      if (videoRef.current) {
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

    return (
      <div
        className={`relative group ${
          isShort
            ? "w-[280px] flex-shrink-0"
            : "bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden"
        }`}
      >
        <Link
          to={`/video/${video._id}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`block relative ${isShort ? "" : "pb-[56.25%]"}`}
        >
          <video
            ref={videoRef}
            src={video.videoUrl}
            className={`absolute top-0 left-0 w-full h-full object-cover ${
              isShort ? "aspect-[9/16]" : "aspect-video"
            }`}
            preload="metadata"
            playsInline
            muted
            loop
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        </Link>

        <div className={`p-3 ${isShort ? "bg-black text-white" : ""}`}>
          <div className="flex gap-3">
            {!isShort && video.owner?.avatar && (
              <img
                src={video.owner.avatar}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold line-clamp-2">{video.title}</h3>
              
              {!isShort && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {video.owner?.username || "Unknown"}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            <span>{video.views?.toLocaleString() || 0} views</span>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between gap-2">
           

            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(video._id);
                }}
                className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                title="Remove"
              >
                <FaTrash size={14} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    `${window.location.origin}/video/${video._id}`
                  );
                  toast.success("Link copied!");
                }}
                className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
                title="Share"
              >
                <FaShare size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <FaClock className="text-5xl text-gray-400 mb-4" />
        <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
          Your Watch Later is empty
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Save videos to watch later by clicking the clock icon when hovering over videos
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <FaClock className="text-2xl text-blue-500" />
        <h1 className="text-2xl font-bold">Watch Later</h1>
      </div>

      {/* Shorts Section */}
      {videos.filter(v => v.isShort).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Shorts</h2>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {videos.filter(v => v.isShort).map((video) => (
                <VideoCard key={video._id} video={video} onRemove={removeFromWatchLater} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Regular Videos Section */}
      {videos.filter(v => !v.isShort).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.filter(v => !v.isShort).map((video) => (
              <VideoCard key={video._id} video={video} onRemove={removeFromWatchLater} />
            ))}
          </div>
        </div>
      )}

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