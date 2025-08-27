/* eslint-disable no-unused-vars */

"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axiosInstance.jsx";
import LikeButton from "./likeButton.jsx";
import "../../../index.css";

const LikedVideosPage = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const navigate = useNavigate();

   const fetchLikedVideos = async () => {
    try {
      const res = await API.get("/user/videos/liked-videos");
      const data = res?.data?.data?.likedVideos;

      if (Array.isArray(data)) {
        setLikedVideos(data);
      } else {
        setLikedVideos([]); // fallback if response is unexpected
        toast.error("Unexpected data format from API");
      }
    } catch (err) {
      toast.error("Failed to fetch liked videos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedVideos();
    const refreshInterval = setInterval(() => {
      fetchLikedVideos();
      console.log("Refreshing liked videos data...");
    }, 1000 * 60 * 5); // Every 5 mins
    return () => clearInterval(refreshInterval);
  }, []);

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  const handlePreviewClick = (videoId, e) => {
    e.stopPropagation();
    const video = likedVideos.find((v) => v._id === videoId);
    if (video) setActiveVideo(video);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  const handleWatchLater = async (videoId) => {
    try {
      const res = await API.post(`/users/watch-later/${videoId}`);
      if (res?.data?.success) toast.success("Added to Watch Later");
      else toast.error(res?.data?.message || "Failed to add");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleShare = (video) => {
    const url = `${window.location.origin}/video/${video._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <section className="p-2 mx-auto shadow-md dark:bg-gray-900 hover:text-lime-950">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white hover:text-orange-600">
        ❤️ Liked Videos
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : likedVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl hover:text-lime-950">❤️</span>
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2 hover:text-gray-950">
            No liked videos yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Explore videos and like some to see them here.
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Videos you like will appear here. Start exploring and like some
            videos!
          </p>
        </div>
      ) : (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-4 md:gap-4 lg:gap-4 dark:bg-gray-900"
        >
          {likedVideos.map((video) => (
            <motion.div
              key={video._id}
              whileHover={{ y: -5 }}
              onClick={() => handleVideoClick(video._id)}
              className="dark:bg-gray-800 cursor-pointer transition-all duration-200 hover:shadow-lg"
            >
              <div className="relative pb-[60.25%] overflow-hidden">
                {video?.videoUrl && (
                  <video
                    src={video.videoUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    controls
                    muted
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => e.target.pause()}
                    onClick={(e) => handlePreviewClick(video._id, e)}
                  />
                )}
              </div>

              <div className="p-1">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">
                  {video.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {video.description}
                </p>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {video.views} views
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div
                  className="flex flex-wrap gap-2 items-center justify-start mt-1"
                  onClick={handleActionClick}
                >
                  <LikeButton videoId={video._id} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWatchLater(video._id);
                    }}
                    className="text-xs px-3 py-1 rounded cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition"
                  >
                    Watch Later
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(video);
                    }}
                    className="text-xs px-3 py-1 rounded hover:scale-110 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
                  >
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};

// Skeleton loader
const SkeletonCard = () => (
  <div className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
    <div className="aspect-video bg-gray-300 dark:bg-gray-600 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4" />
      <div className="flex justify-between">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/3" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/3" />
      </div>
    </div>
  </div>
);

export default LikedVideosPage;
