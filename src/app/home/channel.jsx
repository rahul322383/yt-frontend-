/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../utils/axiosInstance.jsx";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Sun, Moon, Shuffle } from "lucide-react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
// import LoadingSpinner from "../components/common/loadingSpinner.jsx";
import ShareCard from "../components/VideoCard/shareCard.jsx";
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

  const handleSubscribe = async () => {
    if (!channelId || isLoading) return;

    setIsLoading(true);
    try {
      const res = await API.post(`/users/subscribe/${channelId}`);
      const { success } = res.data;

      if (success) {
        const newState = !isSubscribed;
        setIsSubscribed(newState);
        setDisplayCount((prev) => (newState ? prev + 1 : Math.max(0, prev - 1)));
        toast.success(newState ? "Subscribed" : "Unsubscribed");
        if (!newState) setIsNotified(false);
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = () => {
    const newPref = notificationPref === "all" ? "none" : "all";
    setNotificationPref(newPref);
    toast.success(`Notifications ${newPref === "all" ? "enabled" : "disabled"}`);
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);
  const toggleShuffle = () => setShuffle((prev) => !prev);

  const formatSubs = (count) =>
    count >= 1_000_000
      ? (count / 1_000_000).toFixed(1) + "M"
      : count >= 1_000
      ? (count / 1_000).toFixed(1) + "K"
      : count;

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

  const shuffledPlaylists = shuffle
    ? [...(channel?.playlists || [])].sort(() => 0.5 - Math.random())
    : channel?.playlists || [];

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
  //       <LoadingSpinner size="lg" />
  //     </div>
  //   );
  // }

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
      <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-gray-800 dark:to-gray-900">
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
            <h1 className="text-2xl sm:text-3xl font-bold">{channel.username}</h1>
            <div className="flex flex-wrap gap-4 items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {formatSubs(subscribers.total)} subscribers
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {getAllVideos().length} videos
              </span>
            </div>
          </div>

          <div className="flex gap-3 items-center">
<button
  onClick={handleSubscribe}
  className={`px-5 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all ${
    isSubscribed
      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
      : "bg-red-600 hover:bg-red-700 text-white"
  }`}
>
  {isSubscribed ? "Subscribed" : "Subscribe"}
</button>


            {isSubscribed && (
              <button
                onClick={toggleNotifications}
                className="p-2.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
                data-tooltip-id="notifications-tooltip"
              >
                {notificationPref === "all" ? (
                  <Bell size={18} />
                ) : (
                  <BellOff size={18} />
                )}
                <ReactTooltip
                  id="notifications-tooltip"
                  place="bottom"
                  content={
                    notificationPref === "all"
                      ? "Disable notifications"
                      : "Enable notifications"
                  }
                />
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar">
            {["home", "videos", "playlists", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
                  activeTab === tab
                    ? "border-red-600 text-red-600 dark:text-red-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                } transition-colors`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
              {/* Videos Section */}
              <div>
                <h2 className="text-xl font-bold mb-4">Videos</h2>
                {filteredVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredVideos.map((video) => (
                      <Link
                        key={video._id || video.videoId}
                        to={`/videos/${video._id || video.videoId}`}
                        className="group block rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                          <video
                            src={video.videoUrl}
                            controls={false}
                            muted
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(video.uploadedAt || video.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
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
                  <button
                    onClick={toggleShuffle}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Shuffle size={16} />
                    {shuffle ? "Shuffling" : "Shuffle"}
                  </button>
                </div>

                {shuffledPlaylists.length > 0 ? (
                  <div className="space-y-4">
                    {shuffledPlaylists.map((playlist) => (
                      <div
                        key={playlist._id}
                        className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Link
                          to={`/playlists/${playlist._id}`}
                          className="relative flex-shrink-0 w-full sm:w-48 h-32 bg-gray-200 dark:bg-gray-700 overflow-hidden"
                        >
                          {playlist.videos?.[0] ? (
                            <video
                              src={playlist.videos[0].videoUrl}
                              muted
                              loop
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-xs">No Video</span>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {playlist.videos?.length || 0} videos
                          </div>
                        </Link>

                        <div className="p-4 flex-1 flex flex-col">
                          <div>
                            <h3 className="font-semibold text-lg mb-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                              <Link to={`/playlists/${playlist._id}`}>
                                {playlist.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {playlist.description || "No description"}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 flex items-center">
                          <Link
                            to={`/playlists/${playlist._id}`}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-full transition-colors"
                          >
                            View Playlist
                          </Link>
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

              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredVideos.map((video) => (
                    <Link
                      key={video._id || video.videoId}
                      to={`/videos/${video._id || video.videoId}`}
                      className="group block rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                        <video
                          src={video.videoUrl}
                          controls={false}
                          muted
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(video.uploadedAt || video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
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
                <button
                  onClick={toggleShuffle}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Shuffle size={16} />
                  {shuffle ? "Shuffling" : "Shuffle"}
                </button>
              </div>

              {shuffledPlaylists.length > 0 ? (
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
              
              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Channel Details</h3>
                  <ul className="text-sm space-y-2 mt-2">
                    <li className="flex">
                      <span className="text-gray-500 dark:text-gray-400 w-32">Joined</span>
                      <span>{new Date(channel.createdAt).toLocaleDateString()}</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-500 dark:text-gray-400 w-32">Subscribers</span>
                      <span>{formatSubs(subscribers.total)}</span>
                    </li>
                    <li className="flex">
                      <span className="text-gray-500 dark:text-gray-400 w-32">Total Videos</span>
                      <span>{getAllVideos().length}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChannelPage;