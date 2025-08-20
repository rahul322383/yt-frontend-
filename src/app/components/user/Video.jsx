/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axiosInstance.jsx";
import VideoDetailPage from "../VideoCard/VideoDetailsPage.jsx";
import { FiPlay, FiVolume2, FiVolumeX } from "react-icons/fi";
import { BsBookmarkCheck, BsBookmarkPlus } from "react-icons/bs";
import toast from "react-hot-toast";

const VideoCardSkeleton = () => (
  <div className="w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-md animate-pulse">
    <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
    <div className="p-4">
      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
  </div>
);

const ChannelAvatar = ({ src, username }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse dark:bg-gray-600" />
      )}
      <img
        src={src}
        alt={`${username}'s avatar`}
        className={`w-8 h-8 rounded-full object-cover ${loaded ? "block" : "hidden"}`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </>
  );
};

const VideoCard = ({
  video,
  onVideoClick,
  onChannelClick,
  onWatchLaterToggle,
  watchLaterList,
}) => {
  const [hover, setHover] = useState(false);
  const [muted, setMuted] = useState(true);
  const isWatchLater = watchLaterList.includes(video._id);

  return (
    <div
      className="w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onVideoClick(video)}
    >
      {/* Video Preview */}
      <div className="relative w-full aspect-video bg-black">
        <video
          src={video.videoUrl}
          className="absolute w-full h-full"
          muted={muted}
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
            <FiPlay className="text-white text-xl ml-1" />
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMuted(!muted);
          }}
          className="absolute bottom-2 right-2 p-1.5 bg-black/50 text-white rounded-full"
        >
          {muted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
        </button>
        <div className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">
          {video.duration || "0:00"}
        </div>
      </div>

      {/* Meta info */}
      <div className="p-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold line-clamp-2 dark:text-white mb-1">
              {video.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
              <ChannelAvatar
                src={video.owner?.avatar}
                username={video.owner?.username}
              />
              <span className="truncate max-w-[120px]">
                {video.owner?.username}
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* <LikeButton videoId={video._id} initialLikes={video.likeCount} /> */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWatchLaterToggle(video._id);
              }}
              className={`p-1 rounded-full ${
                isWatchLater
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              }`}
              aria-label={isWatchLater ? "Remove from watch later" : "Add to watch later"}
            >
              {isWatchLater ? <BsBookmarkCheck size={18} /> : <BsBookmarkPlus size={18} />}
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2 mt-2">
          <span>{video.views.toLocaleString()} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

const Video = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [watchLaterList, setWatchLaterList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const limit = 12;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/videos", {
        params: { search, page, limit },
        withCredentials: true,
      });
      setVideos(res.data.data.videos);
      setTotal(res.data.data.totalVideos);
      setWatchLaterList(res.data.data.watchLaterList || []);
      setSelectedVideo(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [search, page]);

  const totalPages = Math.ceil(total / limit);

  const onWatchLaterToggle = async (videoId) => {
    try {
      if (watchLaterList.includes(videoId)) {
        await API.delete(`/users/watch-later/${videoId}`, { withCredentials: true });
        setWatchLaterList((prev) => prev.filter((id) => id !== videoId));
        toast.success("Removed from Watch Later");
      } else {
        await API.post(`/users/watch-later/${videoId}`, {}, { withCredentials: true });
        setWatchLaterList((prev) => [...prev, videoId]);
        toast.success("Added to Watch Later");
      }
    } catch (err) {
      toast.error("Failed to update Watch Later");
    }
  };

  const handleVideoClick = (video) => {
    // if (video.playlistId?.[0]) {
    //   navigate(`/playlists/${video.playlistId[0]}`);
    // } else {
    //   setSelectedVideo(video);
      navigate(`/video/${video._id}`);
    // }
  };

  const handleChannelClick = (video) => {
    const channelId = video.channelId || video.owner?._id;
    if (channelId) {
      navigate(`/channel/${channelId}`);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Videos</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="search"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No videos found. Try a different search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onVideoClick={handleVideoClick}
              onChannelClick={handleChannelClick}
              onWatchLaterToggle={onWatchLaterToggle}
              watchLaterList={watchLaterList}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && videos.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-md bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-md bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Next
          </button>
        </div>
      )}

      {selectedVideo && (
        <VideoDetailPage
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </main>
  );
};

export default Video;