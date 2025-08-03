/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../utils/axiosInstance.jsx";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Sun, Moon, Shuffle, Clock, BarChart2, List, User, Grid } from "lucide-react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import LoadingSpinner from "../components/common/loadingSpinner.jsx";
import SubscriptionButton from "../components/VideoCard/SubscriptionButton.jsx";
import ShareCard from "../components/VideoCard/ShareCard.jsx";
import "../../index.css";

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const ChannelPage = () => {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [subscribers, setSubscribers] = useState({ total: 0, subscribers: [] });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationPref, setNotificationPref] = useState("none");
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );
  const [activeTab, setActiveTab] = useState("home");
  const [sortBy, setSortBy] = useState("latest");
  const [filterTag, setFilterTag] = useState("all");
  const [shuffle, setShuffle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);
  const [isNotified, setIsNotified] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    fetchChannel();
    fetchSubscribers();
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      setIsLoading(true);
      const res = await API.get(`/users/channel/${channelId}`);
      const data = res.data.data;
      setChannel(data);
      setIsSubscribed(data.channelIsSubscribedTo);
      setNotificationPref(data.notificationPref || "none");
    } catch (err) {
      toast.error("Failed to load channel");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await API.get(`/users/subscribe/channel/${channelId}`);
      setSubscribers(res.data.data);
    } catch (err) {
      toast.error("Error fetching subscribers");
      console.error(err);
    }
  };

  const toggleNotifications = () => {
    const newPref = notificationPref === "all" ? "none" : "all";
    setNotificationPref(newPref);
    toast.success(`Notifications ${newPref === "all" ? "enabled" : "disabled"}`);
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);
  const toggleShuffle = () => setShuffle((prev) => !prev);
  const toggleViewMode = () => setViewMode(prev => prev === "grid" ? "list" : "grid");

  const formatSubs = (count) =>
    count >= 1_000_000
      ? (count / 1_000_000).toFixed(1) + "M"
      : count >= 1_000
      ? (count / 1_000).toFixed(1) + "K"
      : count;

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Get all videos from both channel.videos and playlists
  const getAllVideos = () => {
    const channelVideos = channel?.videos || [];
    const playlistVideos = channel?.playlists?.flatMap(playlist => playlist.videos || []) || [];
    return [...channelVideos, ...playlistVideos];
  };

  const filteredVideos =
    filterTag === "all"
      ? getAllVideos()
      : getAllVideos().filter((video) => video.tags?.includes(filterTag));

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt);
    } else if (sortBy === "oldest") {
      return new Date(a.uploadedAt || a.createdAt) - new Date(b.uploadedAt || b.createdAt);
    } else if (sortBy === "popular") {
      return (b.views || 0) - (a.views || 0);
    }
    return 0;
  });

  const shuffledPlaylists = shuffle
    ? [...(channel?.playlists || [])].sort(() => 0.5 - Math.random())
    : channel?.playlists || [];

  if (isLoading && !channel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-300">
          Channel not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-gray-800 dark:to-gray-900">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Channel Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="relative -mt-16">
            <img
              src={channel.avatar || "/default-avatar.png"}
              alt="Avatar"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">{channel.username}</h1>
              {channel.isVerified && (
                <span className="text-blue-500" data-tooltip-id="verified-tooltip">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <ReactTooltip
                    id="verified-tooltip"
                    place="bottom"
                    content="Verified channel"
                  />
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {formatSubs(subscribers.total)} subscribers
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {getAllVideos().length} videos
              </span>
              {channel.location && (
                <span className="text-gray-600 dark:text-gray-400">
                  {channel.location}
                </span>
              )}
            </div>
            {channel.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 max-w-2xl">
                {channel.bio}
              </p>
            )}
          </div>

            <div className="flex gap-3 items-center"> 
            <div className="flex gap-3 items-center">
  <SubscriptionButton
    channelId={channel.channelId}
    isSubscribedInitially={isSubscribed}
    isNotifiedInitially={notificationPref === "all"}
    subscriberCount={subscribers.total}
    onSubscribedChange={(newStatus) => {
      setIsSubscribed(newStatus);
      if (!newStatus) setNotificationPref("none");
    }}
    onNotificationChange={(newPref) => setNotificationPref(newPref)}
  />

  <button
    onClick={toggleTheme}
    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
    data-tooltip-id="theme-tooltip"
  >
    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    <ReactTooltip
      id="theme-tooltip"
      place="bottom"
      content={darkMode ? "Light mode" : "Dark mode"}
    />
  </button>
</div>

          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar">
            {[
              { id: "home", icon: <Grid size={16} />, label: "Home" },
              { id: "videos", icon: <List size={16} />, label: "Videos" },
              { id: "playlists", icon: <List size={16} />, label: "Playlists" },
              { id: "about", icon: <User size={16} />, label: "About" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-red-600 text-red-600 dark:text-red-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                } transition-colors`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "home" && (
            <motion.div
              key="home"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Featured Section */}
              {channel.featuredVideo && (
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                  <h2 className="text-xl font-bold px-6 pt-6 pb-2">Featured Video</h2>
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                    <video
                      src={channel.featuredVideo.videoUrl}
                      controls={false}
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(channel.featuredVideo.duration || 0)}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{channel.featuredVideo.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {channel.featuredVideo.description || "No description available"}
                    </p>
                    <Link
                      to={`/video/${channel.featuredVideo.videoId}`}
                      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Watch Now
                    </Link>
                  </div>
                </div>
              )}

              {/* Videos Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Latest Videos</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleViewMode}
                      className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      data-tooltip-id="view-mode-tooltip"
                    >
                      {viewMode === "grid" ? <List size={18} /> : <Grid size={18} />}
                      <ReactTooltip
                        id="view-mode-tooltip"
                        place="bottom"
                        content={viewMode === "grid" ? "List view" : "Grid view"}
                      />
                    </button>
                  </div>
                </div>
                {filteredVideos.length > 0 ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredVideos.slice(0, 8).map((video) => (
                        <div
                          key={video.videoId}
                          className="group block rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <Link to={`/video/${video.videoId}`} className="relative block aspect-video bg-gray-200 dark:bg-gray-700">
                            <video
                              src={video.videoUrl}
                              controls={false}
                              muted
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                              {formatDuration(video.duration || 0)}
                            </div>
                          </Link>
                          <div className="p-3">
                            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                              <Link to={`/video/${video.videoId}`}>
                                {video.title}
                              </Link>
                            </h3>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {video.views || 0} views
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(video.uploadedAt || video.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredVideos.slice(0, 8).map((video) => (
                        <div
                          key={video.videoId}
                          className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <Link
                            to={`/video/${video.videoId}`}
                            className="relative flex-shrink-0 w-full sm:w-48 h-32 bg-gray-200 dark:bg-gray-700"
                          >
                            <video
                              src={video.videoUrl}
                              controls={false}
                              muted
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                              {formatDuration(video.duration || 0)}
                            </div>
                          </Link>
                          <div className="p-4 flex-1">
                            <h3 className="font-semibold text-lg mb-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                              <Link to={`/video/${video.videoId}`}>
                                {video.title}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {video.description || "No description"}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{video.views || 0} views</span>
                              <span>{new Date(video.uploadedAt || video.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No videos found
                  </div>
                )}
              </div>

              {/* Playlists Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Playlists</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleShuffle}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Shuffle size={16} />
                      {shuffle ? "Shuffling" : "Shuffle"}
                    </button>
                  </div>
                </div>

                {shuffledPlaylists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shuffledPlaylists.slice(0, 6).map((playlist) => (
                      <div
                        key={playlist._id}
                        className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Link
                          to={`/playlists/${playlist._id}`}
                          className="relative block aspect-video bg-gray-200 dark:bg-gray-700"
                        >
                          {playlist.videos?.[0] ? (
                            <video
                              src={playlist.videos[0].videoUrl}
                              muted
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span>No videos</span>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {playlist.videos?.length || 0} videos
                          </div>
                        </Link>
                        <div className="p-4">
                          <h3 className="font-semibold mb-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <Link to={`/playlists/${playlist._id}`}>
                              {playlist.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {playlist.description || "No description"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No playlists available
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "videos" && (
            <motion.div
              key="videos"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-bold">All Videos</h2>
                <div className="flex gap-3">
                  <button
                    onClick={toggleViewMode}
                    className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    data-tooltip-id="view-mode-tooltip"
                  >
                    {viewMode === "grid" ? <List size={18} /> : <Grid size={18} />}
                    <ReactTooltip
                      id="view-mode-tooltip"
                      place="bottom"
                      content={viewMode === "grid" ? "List view" : "Grid view"}
                    />
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              {sortedVideos.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedVideos.map((video) => (
                      <div
                        key={video.videoId}
                        className="group block rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Link to={`/video/${video.videoId}`} className="relative block aspect-video bg-gray-200 dark:bg-gray-700">
                          <video
                            src={video.videoUrl}
                            controls={false}
                            muted
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                            {formatDuration(video.duration || 0)}
                          </div>
                        </Link>
                        <div className="p-3">
                          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            <Link to={`/video/${video.videoId}`}>
                              {video.title}
                            </Link>
                          </h3>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {video.views || 0} views
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(video.uploadedAt || video.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedVideos.map((video) => (
                      <div
                        key={video.videoId}
                        className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Link
                          to={`/video/${video.videoId}`}
                          className="relative flex-shrink-0 w-full sm:w-48 h-32 bg-gray-200 dark:bg-gray-700"
                        >
                          <video
                            src={video.videoUrl}
                            controls={false}
                            muted
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                            {formatDuration(video.duration || 0)}
                          </div>
                        </Link>
                        <div className="p-4 flex-1">
                          <h3 className="font-semibold text-lg mb-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <Link to={`/video/${video.videoId}`}>
                              {video.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {video.description || "No description"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{video.views || 0} views</span>
                            <span>{new Date(video.uploadedAt || video.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No videos found
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "playlists" && (
            <motion.div
              key="playlists"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Playlists</h2>
                <div className="flex gap-2">
                  <button
                    onClick={toggleViewMode}
                    className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    data-tooltip-id="view-mode-tooltip"
                  >
                    {viewMode === "grid" ? <List size={18} /> : <Grid size={18} />}
                    <ReactTooltip
                      id="view-mode-tooltip"
                      place="bottom"
                      content={viewMode === "grid" ? "List view" : "Grid view"}
                    />
                  </button>
                  <button
                    onClick={toggleShuffle}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700"
                  >
                    <Shuffle size={16} />
                    {shuffle ? "Shuffling" : "Shuffle"}
                  </button>
                </div>
              </div>

              {shuffledPlaylists.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shuffledPlaylists.map((playlist) => (
                      <div
                        key={playlist._id}
                        className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Link
                          to={`/playlists/${playlist._id}`}
                          className="relative block aspect-video bg-gray-200 dark:bg-gray-700"
                        >
                          {playlist.videos?.[0] ? (
                            <video
                              src={playlist.videos[0].videoUrl}
                              muted
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span>No videos</span>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {playlist.videos?.length || 0} videos
                          </div>
                        </Link>
                        <div className="p-4">
                          <h3 className="font-semibold mb-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <Link to={`/playlists/${playlist._id}`}>
                              {playlist.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {playlist.description || "No description"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shuffledPlaylists.map((playlist) => (
                      <div
                        key={playlist._id}
                        className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Link
                          to={`/playlists/${playlist._id}`}
                          className="relative flex-shrink-0 w-full sm:w-48 h-32 bg-gray-200 dark:bg-gray-700"
                        >
                          {playlist.videos?.[0] ? (
                            <video
                              src={playlist.videos[0].videoUrl}
                              muted
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span>No videos</span>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {playlist.videos?.length || 0} videos
                          </div>
                        </Link>
                        <div className="p-4 flex-1">
                          <h3 className="font-semibold text-lg mb-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <Link to={`/playlists/${playlist._id}`}>
                              {playlist.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {playlist.description || "No description"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{playlist.videos?.length || 0} videos</span>
                            <span>Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No playlists available
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="prose dark:prose-invert max-w-3xl"
            >
              <h2 className="text-2xl font-bold mb-6">About {channel.username}</h2>
              
              {channel.bio && (
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {channel.bio}
                  </p>
                </div>
              )}

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Channel Details</h3>
                  <ul className="text-sm space-y-3">
                    <li className="flex">
                      <span className="text-gray-500 dark:text-gray-400 w-40">Joined</span>
                      <span>{new Date(channel.createdAt).toLocaleDateString()}</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-500 dark:text-gray-400 w-40">Subscribers</span>
                      <span>{formatSubs(subscribers.total)}</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-500 dark:text-gray-400 w-40">Total Videos</span>
                      <span>{getAllVideos().length}</span>
                    </li>
                    {channel.location && (
                      <li className="flex">
                        <span className="text-gray-500 dark:text-gray-400 w-40">Location</span>
                        <span>{channel.location}</span>
                      </li>
                    )}
                    {channel.website && (
                      <li className="flex">
                        <span className="text-gray-500 dark:text-gray-400 w-40">Website</span>
                        <a 
                          href={channel.website.startsWith('http') ? channel.website : `https://${channel.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          {channel.website}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>

                {channel.socialLinks && Object.values(channel.socialLinks).some(link => link) && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Social Links</h3>
                    <div className="flex gap-4">
                      {channel.socialLinks.youtube && (
                        <a 
                          href={channel.socialLinks.youtube} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          YouTube
                        </a>
                      )}
                      {channel.socialLinks.twitter && (
                        <a 
                          href={channel.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Twitter
                        </a>
                      )}
                      {channel.socialLinks.instagram && (
                        <a 
                          href={channel.socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-500 hover:underline"
                        >
                          Instagram
                        </a>
                      )}
                      {channel.socialLinks.facebook && (
                        <a 
                          href={channel.socialLinks.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8">
               <button>
<SubscriptionButton
  channelId={channel._id}
  isSubscribedInitially={channel.channelIsSubscribedTo}
  isNotifiedInitially={channel.notificationPref === "all"}
  subscriberCount={channel.subscribersCount}
/>

               </button>
               
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChannelPage;