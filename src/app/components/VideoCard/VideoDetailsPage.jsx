/* eslint-disable no-unused-vars */

"use client";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../utils/axiosInstance.jsx";
import SubscriptionButton from "../VideoCard/SubscriptionButton.jsx";
import LikeButton from "../VideoCard/likeButton.jsx";
import ShareButton from "../VideoCard/ShareCard.jsx";
import CommentSection from "../VideoCard/CommentSection.jsx";
import { toast } from "react-hot-toast";
import { 
  FaRandom, 
  FaClock, 
  FaPlay, 
  FaPause, 
  FaEdit, 
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaSun,
  FaMoon
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

const VideoDetailPage = () => {
  const { id: videoId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const sidebarRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [video, setVideo] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [autoplay, setAutoplay] = useState(() => 
    JSON.parse(localStorage.getItem("autoplay")) ?? true
  );
  const [shuffle, setShuffle] = useState(() => 
    JSON.parse(localStorage.getItem("shuffle")) ?? false
  );
  const [watchLater, setWatchLater] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) return JSON.parse(savedMode);
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const token = localStorage.getItem("accessToken");
  const isAuth = !!token;
  const isOwner = video?.isOwner;

  // Memoized shuffled playlist
  const shuffledPlaylist = useMemo(() => {
    return shuffle ? [...playlistVideos].sort(() => 0.5 - Math.random()) : playlistVideos;
  }, [playlistVideos, shuffle]);

  // Apply dark/light mode to the document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    fetchData();
  }, [videoId]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("autoplay", JSON.stringify(autoplay));
    localStorage.setItem("shuffle", JSON.stringify(shuffle));
  }, [autoplay, shuffle]);

  // Escape key handler for modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowEditModal(false);
        setShowDeleteModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      // Fetch the video
      const videoRes = await API.get(`/user/playlist/videos/${videoId}`);

      if (videoRes?.data?.success) {
        setVideo(videoRes.data.data.video);
        setPlaylistVideos(videoRes.data.data.playlistVideos || []);
      } else {
        toast.error("Video not found");
        return;
      }

      // Only fetch user if token exists
      if (token) {
        try {
          const userRes = await API.get("/users/me");
          setCurrentUser(userRes.data.data); 
          setWatchLater(userRes.data?.data?.watchLater?.includes(videoId) || false);
        } catch (err) {
          console.error("User fetch error:", err);
          // Continue without user data but don't break the app
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnded = useCallback(() => {
    if (!autoplay || !playlistVideos.length) return;
    
    const list = shuffledPlaylist;
    const currentIndex = list.findIndex(v => v._id === videoId);
    
    // Guard clause for when current video isn't found in the list
    if (currentIndex === -1) return;
    
    if (currentIndex < list.length - 1) {
      navigate(`/video/${list[currentIndex + 1]._id}`);
    }
  }, [autoplay, playlistVideos, shuffledPlaylist, videoId, navigate]);

  const toggleWatchLater = async () => {
    try {
      const res = await API.post(`/users/watch-later/${videoId}`);
      setWatchLater(res.data?.isInWatchLater ?? !watchLater);
      toast.success(watchLater ? "Removed from Watch Later" : "Added to Watch Later");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update Watch Later");
    }
  };

  useEffect(() => {
    if (video?.channelId) {
      fetchSubscribers(video.channelId);
    }
  }, [video]);

  const fetchSubscribers = async (channelId) => {
    try {
      const res = await API.get(`/users/subscribe/channel/${channelId}`);
      setSubscribers(res.data.data);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
    }
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
    toast.success(`Shuffle ${!shuffle ? "enabled" : "disabled"}`);
  };

  const toggleAutoplay = () => {
    setAutoplay(!autoplay);
    toast.success(`Autoplay ${!autoplay ? "enabled" : "disabled"}`);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Edit video function
  const handleEdit = () => {
    setEditTitle(video.title);
    setEditDesc(video.description || "");
    setShowEditModal(true);
    setShowMenu(false);
  };
  
  // Update video function
  const updateVideo = async () => {
    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    
    try {
      setIsUpdating(true);
      const res = await API.put(`/user/playlist/videos/${videoId}`, {
        title: editTitle,
        description: editDesc
      });
      
      if (res.data.success) {
        setVideo({...video, title: editTitle, description: editDesc});
        toast.success("Video updated successfully");
        setShowEditModal(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update video");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Delete video function
  const handleDelete = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };
  
  const deleteVideo = async () => {
    try {
      setIsDeleting(true);
      await API.delete(`/user/playlist/videos/${videoId}`);
      toast.success("Video deleted successfully");
      setShowDeleteModal(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete video");
      setIsDeleting(false);
    }
  };

  // Format duration helper function
  const formatDuration = (duration) => {
    if (!duration || duration === "0") return "0:00";
    
    // If it's already formatted, return as is
    if (typeof duration === "string" && duration.includes(":")) {
      return duration;
    }
    
    // Convert seconds to MM:SS format
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  );

  if (!video) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xl">
      Video not found
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <FaSun className="text-yellow-500 text-xl" />
        ) : (
          <FaMoon className="text-gray-700 text-xl" />
        )}
      </button>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content (70% width on lg+) */}
          <div className="w-full lg:w-[70%]">
            {/* Video Player */}
            <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden">
              {video?.videoUrl && (
                <video
                  src={video.videoUrl}
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  controls
                  muted
                  onEnded={handleEnded}
                  ref={playerRef}
                />
              )}
            </div>

            {/* Video Info */}
            <div className="mt-6">
              <h1 className="text-2xl md:text-3xl font-bold break-words text-gray-900 dark:text-white">
                {video.title}
              </h1>
              
              {/* Channel Info and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
                  onClick={() => navigate(`/channel/${video.channelId}`)}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {video.avatarUrl ? (
                      <img 
                        src={video.avatarUrl} 
                        alt={video.creatorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-yellow-500 text-black font-bold text-xl">
                        {video.creatorName?.charAt(0).toUpperCase() || "C"}
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition truncate">
                      {video.creatorName || "Unknown Creator"}
                    </p>
                    <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 items-center">
                      <span className="flex items-center gap-1">
                        <FaEye className="text-xs" />
                        {video.views?.toLocaleString()} views
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-xs" />
                        {new Date(video.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-center flex-wrap">
                  <SubscriptionButton
                    channelId={video.channelId}
                    isSubscribedInitially={video.isSubscribed || false}
                    subscriberCount={video.subscribersCount || 0}
                    isNotifiedInitially={video.notificationEnabled || false}
                    isOwnChannel={isOwner}
                  />
                  <div className="relative">
                    <button 
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      aria-label="More options"
                    >
                      <BsThreeDotsVertical className="text-xl text-gray-700 dark:text-gray-300" />
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                        {isAuth && (
                          <button
                            onClick={toggleWatchLater}
                            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                          >
                            <FaClock className="text-yellow-500" />
                            {watchLater ? "Remove from Watch Later" : "Save to Watch Later"}
                          </button>
                        )}
                        {isOwner && (
                          <>
                            <button
                              onClick={handleEdit}
                              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                            >
                              <FaEdit className="text-blue-500" />
                              Edit Video
                            </button>
                            <button
                              onClick={handleDelete}
                              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                            >
                              <FaTrash />
                              Delete Video
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Description */}
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Description</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {video.description || "No description provided"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <LikeButton
                  videoId={video._id}
                  initialLikeState={video.isLiked || false}
                  initialLikeCount={video.likeCount || 0}
                  initialDislikeCount={video.dislikeCount || 0}
                  isAuthenticated={isAuth}
                />

                <button
                  onClick={toggleAutoplay}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                    autoplay 
                      ? "bg-yellow-500 text-black hover:bg-yellow-400" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  aria-label={autoplay ? "Disable autoplay" : "Enable autoplay"}
                >
                  {autoplay ? <FaPause /> : <FaPlay />}
                  <span className="hidden sm:inline">Autoplay</span>
                </button>

                {playlistVideos.length > 0 && (
                  <button
                    onClick={toggleShuffle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                      shuffle 
                        ? "bg-yellow-500 text-black hover:bg-yellow-400" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                    aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
                  >
                    <FaRandom />
                    <span className="hidden sm:inline">Shuffle</span>
                  </button>
                )}

                <ShareButton video={video} />
              </div>

              {/* Comments Section */}
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Comments ({video.commentCount || 0})
                  </h3>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    type="button"
                    className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 transition px-2 py-1 rounded"
                  >
                    {showComments ? "Hide Comments" : "Show Comments"}
                  </button>
                </div>

                {showComments && (
                  <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
                    <CommentSection 
                      videoId={video._id} 
                      currentUser={currentUser}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playlist Sidebar (30% width on lg+) */}
          <div 
            ref={sidebarRef}
            className="w-full lg:w-[30%] lg:sticky lg:top-4"
          >
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Up Next</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {playlistVideos.length} videos
                </span>
              </div>
              
              <div className="space-y-3">
                {shuffledPlaylist
                  .filter(v => v._id !== videoId)
                  .slice(0, 10)
                  .map((v) => (
                    <div
                      key={v._id}
                      onClick={() => navigate(`/video/${v._id}`)}
                      className="flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/50 transition group"
                    >
                      <div className="relative flex-shrink-0 w-40 h-24 rounded-md overflow-hidden bg-black">
                        <video
                          src={v.videoUrl + "#t=1"}
                          muted
                          preload="metadata"
                          onMouseOver={(e) => {
                            e.target.currentTime = 1;
                            e.target.play().catch(() => {});
                          }}
                          onMouseOut={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0;
                          }}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs rounded text-white">
                          {formatDuration(v.duration)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition text-gray-900 dark:text-white">
                          {v.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 hover:text-yellow-600 dark:hover:text-yellow-400 transition">
                          {v.creatorName || "Unknown Creator"}
                        </p>
                        <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1 items-center">
                          <span className="flex items-center gap-1">
                            <FaEye className="text-xs" />
                            {v.views?.toLocaleString()} views
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="text-xs" />
                            {new Date(v.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
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
                aria-label="Close edit modal"
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
                aria-label="Close delete modal"
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

export default VideoDetailPage;