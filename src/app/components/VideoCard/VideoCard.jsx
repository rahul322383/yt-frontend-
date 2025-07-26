"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import LikeButton from "./likeButton";
import CommentSection from "./CommentSection";
import { FaPlay, FaEdit, FaTrash, FaBookmark, FaComment } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const VideoCard = ({ video, onUpdated, currentUser }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate(); // ✅ FIXED here
  const [isHovering, setIsHovering] = useState(false);
  const [views, setViews] = useState(video?.views || 0);
  const [hoverPercent, setHoverPercent] = useState(0);
  const [spriteThumbX, setSpriteThumbX] = useState(0);
  const [showScrub, setShowScrub] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(video?.title || "");
  const [editDesc, setEditDesc] = useState(video?.description || "");

  const spritePerRow = 10;
  const spriteThumbWidth = 160;
  const videoId = video?.videoId || video?._id;
  const isOwner = currentUser?._id === video?.owner?._id;

  useEffect(() => {
    setViews(video?.views || 0);
  }, [video]);

  const handleVideoClick = () => {
    navigate(`/video/${videoId}`);
  };

  const handleHover = (e) => {
    if (!videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    const duration = videoRef.current.duration || 0;

    setHoverPercent(pct * 100);
    setShowScrub(true);

    const sec = Math.floor(duration * pct);
    setSpriteThumbX(sec % spritePerRow);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowScrub(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleWatchLater = async (e) => {
    e.stopPropagation();
    try {
      const res = await API.post(`/users/watch-later/${videoId}`);
      toast.success(res?.data?.message || "Added to Watch Later");
    } catch {
      toast.error("Could not update Watch Later");
    }
  };

  const updateVideo = async (e) => {
    e.stopPropagation();
    if (editTitle === video.title && editDesc === video.description) {
      toast.info("No changes detected");
      return;
    }
    setIsUpdating(true);
    try {
      await API.put(`/user/playlist/videos/${videoId}`, {
        title: editTitle,
        description: editDesc,
      });
      toast.success("Video updated successfully");
      onUpdated?.();
      setShowEditModal(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteVideo = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this video?")) return;
    setIsDeleting(true);
    try {
      await API.delete(`/user/playlist/videos/${videoId}`);
      toast.success("Video deleted");
      onUpdated?.();
      setShowDeleteModal(false);
    } catch {
      toast.error("Deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow w-[300px]">
      {/* Video Preview */}
      <div
        className="aspect-video overflow-hidden rounded-lg bg-black relative cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleVideoClick}
        onMouseMove={handleHover}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-cover transition-opacity duration-200 hover:opacity-100 "
          muted
          // playsInline
          preload="metadata"
          onError={() => toast.error("Failed loading video")}
        />

        {isHovering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3">
              <FaPlay className="text-white text-xl" />
            </div>
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>

        <div
          className="absolute bottom-0 left-0 h-[3px] bg-red-600 transition-all duration-100"
          style={{ width: showScrub ? `${hoverPercent}%` : "0%" }}
        />

        {video.thumbnailSpriteUrl && showScrub && (
          <div
            className="absolute bottom-full left-[var(--hover-x,50%)] w-40 h-24 bg-no-repeat bg-cover border rounded-md shadow-xl pointer-events-none"
            style={{
              transform: "translateX(-50%)",
              "--hover-x": `${hoverPercent}%`,
              backgroundImage: `url(${video.thumbnailSpriteUrl})`,
              backgroundPosition: `-${spriteThumbX * spriteThumbWidth}px 0`,
              backgroundSize: `${spritePerRow * spriteThumbWidth}px auto`,
            }}
          />
        )}
      </div>

      {/* Info & Controls */}
      <div className="p-4">
        <div className="text-md font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 cursor-pointer" onClick={handleVideoClick}>
          {video.title || "Untitled Video"}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
          {video.owner?.name || "Unknown"} • {views} views
        </p>

        <div className="flex flex-wrap gap-2 hover:gap-3 cursor-pointer">
          <LikeButton
                  videoId={video.videoId || video._id}
                  initialLikeState={video.isLiked}
                  initialLikeCount={video.likes}
                  initialDislikeCount={video.dislikes}
                  
                />

          <button
            onClick={handleWatchLater}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-full transition"
          >
            <FaBookmark size={12} /> Save
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowComments((c) => !c);
            }}
            className="flex items-center gap-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs rounded-full transition"
          >
            <FaComment size={12} /> {showComments ? "Hide" : "Comments"}
          </button>

          {isOwner && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-white text-xs rounded-full transition"
              >
                <FaEdit size={12} /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded-full transition"
              >
                <FaTrash size={12} /> Delete
              </button>
            </>
          )}
        </div>

        {showComments && (
          <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
            <CommentSection videoId={videoId} compact />
          </div>
        )}
      </div>



      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 cursor-pointer"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Video
              </h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={updateVideo}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md disabled:bg-blue-400 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Video
              </h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <IoClose size={24} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This action can't be undone. Are you sure?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={deleteVideo}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md disabled:bg-red-400 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;