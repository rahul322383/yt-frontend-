
/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import API from "../../utils/axiosInstance.jsx";
import "../../index.css";

const ITEMS_PER_PAGE = 12;

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  // Fetch history
  const fetchWatchHistory = async () => {
    try {
      const res = await API.get("/users/watch-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to fetch watch history");
    } finally {
      setLoading(false);
    }
  };

  // Clear all history
  const handleClearAll = async () => {
    if (!confirm("Clear all watch history?")) return;
    try {
      await API.delete("/users/clear-watch-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory([]);
      toast.success("Watch history cleared");
    } catch (err) {
      toast.error("Failed to clear history");
    }
  };

  // Remove single video
  const handleRemoveVideo = async (videoId) => {
    try {
      await API.delete(`/users/remove-watch-history/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((v) => v._id !== videoId));
      toast.success("Removed from history");
    } catch (err) {
      toast.error("Failed to remove video");
    }
  };

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const paginatedHistory = history.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" && page < totalPages) setPage((p) => p + 1);
      if (e.key === "ArrowLeft" && page > 1) setPage((p) => p - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, totalPages]);

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  // Skeleton Loader
  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 dark:bg-gray-700 w-full h-40 rounded-xl mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex">

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="text-red-600" size={24} />
              Watch History
            </h1>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium flex items-center gap-2"
            >
              <Trash2 size={16} />
              Clear all history
            </button>
          )}
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <div className="text-center py-20">
            <Clock size={40} className="mx-auto mb-3 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">No videos watched yet</h2>
            <p className="text-gray-500">
              Start watching to see your history here.
            </p>
          </div>
        ) : (
          <>
            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
{paginatedHistory.map((video) => (
  <div
    key={video._id}
    className="group relative"
    onMouseEnter={() => setHoveredVideo(video._id)}
    onMouseLeave={() => setHoveredVideo(null)}
  >
    {/* Thumbnail / Video Preview */}
    <div className="relative pb-[100.25%] pt-[36.25%] overflow-hidden rounded-xl shadow-md">
      <video
        src={video?.videoUrl}
        className="absolute top-0 left-0 w-full h-full cursor-pointer object-cover"
        muted
        playsInline
        poster={video?.thumbnailUrl || "/default-thumbnail.png"}
        onMouseEnter={(e) => e.target.play()}
        onMouseLeave={(e) => {
          e.target.pause();
          e.target.currentTime = 0;
        }}
        onClick={() => navigate(`/video/${video.videoId}`)}
      />
    </div>

    {/* Video Info */}
    <div className="mt-2 px-1">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-gray-800 dark:text-white line-clamp-2 cursor-pointer"
            onClick={() => navigate(`/video/${video.videoId}`)}
          >
            {video.title}
          </h3>

          {/* Owner Info */}
          <div className="flex items-center gap-2 mt-1">
            <img
              src={video.owner?.avatar || "/default-avatar.png"}
              alt={video.owner?.username || "User"}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {video.owner?.username || "Unknown"}
            </span>
          </div>

          {/* Stats */}
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {video.views || 0} views • {video.likeCount || 0} likes •{" "}
            {video.dislikeCount || 0} dislikes
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveVideo(video._id);
          }}
          className="p-1 rounded-full text-gray-500 hover:text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Watched Time */}
      <div className="text-xs text-gray-500 mt-1">
        Watched: {new Date(video.createdAt).toLocaleString()}
      </div>
    </div>
  </div>
))}

            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-40"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="text-sm">
                  Page <strong>{page}</strong> of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-40"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
