/* eslint-disable */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../../utils/axiosInstance.jsx";

const WatchLaterPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchLater = async () => {
    try {
      const res = await API.get("/users/watch-later");
      setVideos(res?.data?.data?.videos || []);
    } catch (err) {
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
      toast.error("Error removing video");
    }
  };

  const handleLikeDislike = async (action, videoId) => {
    const storageKey = `video_action_${videoId}`;
    const prev = localStorage.getItem(storageKey);
    const newAction = prev === action ? null : action;

    try {
      await API.post(`/user/videos/${videoId}/toggle-like`, {
        action: newAction,
        previousAction: prev,
      });

      if (newAction) localStorage.setItem(storageKey, newAction);
      else localStorage.removeItem(storageKey);

      toast.success(`You ${newAction || "removed vote"} successfully`);
      fetchWatchLater();
    } catch (err) {
      toast.error("Something went wrong while voting.");
    }
  };

  useEffect(() => {
    fetchWatchLater();
  }, []);

  const VideoCard = ({ video, onRemove }) => {
    const videoRef = useRef(null);
    const isShort = video?.isShort;
    const currentAction = localStorage.getItem(`video_action_${video._id}`);

    const handleMouseEnter = () => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.play();
      }
    };

    const handleMouseLeave = () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };

    return (
      <div
        className={`${
          isShort
            ? "w-full sm:w-[280px] flex-shrink-0"
            : "bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition-all"
        } flex flex-col`}
      >
        <Link
          to={`/video/${video._id}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative overflow-hidden ${isShort ? "" : "rounded-t-xl"}`}
        >
          <video
            ref={videoRef}
            src={video.videoUrl}
            className={`w-full h-full ${
              isShort ? "aspect-[9/16]" : "aspect-video"
            } object-cover`}
            preload="metadata"
            playsInline
            controls={false}
          />
        </Link>

        <div className={`p-3 ${isShort ? "bg-black text-white" : ""}`}>
          <h3 className="text-base font-semibold line-clamp-2">{video.title}</h3>

          {/* Owner Info */}
          <div className="flex items-center gap-2 mt-1 text-sm">
            {video.owner?.avatar && (
              <img
                src={video.owner.avatar}
                alt="avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-gray-500 dark:text-gray-400">
              {video.owner?.username || "Unknown"}
            </span>
          </div>

          {/* Description */}
          {!isShort && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {video.description || "No description available."}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap justify-between text-xs text-gray-500 mt-2">
            <span>📅 {new Date(video.createdAt).toLocaleDateString()}</span>
            <span>👁️ {video.views ?? 0} views</span>
            <span>🕒 {video.duration || "N/A"} min</span>
            {/* <span>💬 {video.commentsCount ?? 0}</span> */}
          </div>

          {/* Like / Dislike */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeDislike("like", video._id);
              }}
              className={`text-xs px-3 py-1 rounded ${
                currentAction === "like"
                  ? "bg-green-200 text-green-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              👍 {video.likesCount ?? 0}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeDislike("dislike", video._id);
              }}
              className={`text-xs px-3 py-1 rounded ${
                currentAction === "dislike"
                  ? "bg-red-200 text-red-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              👎 {video.dislikesCount ?? 0}
            </button>
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-between gap-2">
            <button
              onClick={() => onRemove(video._id)}
              className="text-xs px-3 py-1 bg-red-100 text-red-600 border border-red-300 rounded hover:bg-red-200 transition w-full"
            >
              Remove
            </button>

            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `${window.location.origin}/video/${video._id}`
                ) && toast.success("Link copied!")
              }
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition w-full"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return <div className="p-4 text-center text-lg text-gray-500">Loading Watch Later...</div>;

  if (!videos.length)
    return <div className="p-4 text-center text-gray-500">No videos saved yet 😪</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">📺 Watch Later</h2>

      {/* Shorts - Horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto mb-6 scrollbar-thin scrollbar-thumb-gray-400">
        {videos.filter((v) => v.isShort).map((video) => (
          <VideoCard key={video._id} video={video} onRemove={removeFromWatchLater} />
        ))}
      </div>

      {/* Regular Videos - Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.filter((v) => !v.isShort).map((video) => (
          <VideoCard key={video._id} video={video} onRemove={removeFromWatchLater} />
        ))}
      </div>

      <ToastContainer position="bottom-right" autoClose={1000} />
    </div>
  );
};

export default WatchLaterPage;
