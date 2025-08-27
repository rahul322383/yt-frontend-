"use client"
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const categories = ["All", "Gaming", "Vlog", "Education", "Music", "Tech"];

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { auth } = useAuth(); // ✅ fixed

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      try {
        // 🔐 If user is not logged in
        if (!auth?.user) {
          setLoading(false);
          return;
        }

        const { data } = await API.get("/users/me");
        const channelId = data?.data?.channelId;
        const res = await API.get(`/users/subscribe/subscribed/${channelId}`);
        const fetchedChannels = res.data.data.channels || [];
        setChannels(fetchedChannels);
        setFilteredChannels(fetchedChannels);
      } catch (error) {
        console.error("Failed to fetch subscribed channels", error);
        toast.error("Failed to load subscriptions ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribedChannels();
  }, [auth]);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredChannels(channels);
    } else {
      const filtered = channels.filter(
        (channel) =>
          channel.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredChannels(filtered);
    }
  }, [selectedCategory, channels]);

  // 🚨 Not Logged In State
  if (!auth?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          🚀 Sign in to see your Subscriptions
        </h2>
        <p className="text-gray-500 dark:text-gray-300 mb-6 max-w-md">
          You need to log in to manage and watch videos from your subscribed channels.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/login"
            className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">📺 Subscribed Channels</h1>
      </div>

      {/* Horizontal Scroll Category Bar */}
      <div className="flex overflow-x-auto md:flex-wrap gap-2 md:gap-3 py-2 mb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-700">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-200 border whitespace-nowrap
              ${
                selectedCategory === cat
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white dark:bg-gray-800 dark:text-white text-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Optional Sort Dropdown */}
      <div className="mb-4 text-sm text-right">
        <select className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
          <option value="latest">Sort by Latest</option>
          <option value="favorites">Sort by Favorites</option>
        </select>
      </div>

      {/* Channel Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl animate-pulse flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-400 dark:bg-gray-600" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex gap-3">
                    <div className="w-28 h-16 rounded-md bg-gray-400 dark:bg-gray-600"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded"></div>
                      <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredChannels.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredChannels.map((channel) => (
            <div
              key={channel._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 flex flex-col"
            >
              {/* Channel Header */}
              <Link
                to={`/channel/${channel.channelId}`}
                className="flex items-center gap-3 mb-4"
              >
                <img
                  src={channel.avatar || "/default-avatar.png"}
                  alt={channel.username}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-medium text-sm sm:text-base truncate">
                    {channel.username}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-300 truncate">
                    {channel.subscriberCount?.toLocaleString() || 0} subscribers
                  </p>
                </div>
              </Link>

              {/* Latest Videos Preview */}
              {channel.videos?.length > 0 ? (
                <div className="space-y-3 mt-auto">
                  {channel.videos.slice(0, 2).map((video) => (
                    <Link
                      key={video._id}
                      to={`/video/${video._id}`}
                      className="flex items-start gap-3 group"
                    >
                      {/* Video thumbnail */}
                      <div className="relative w-28 h-16 flex-shrink-0 rounded-md overflow-hidden bg-black">
                        <video
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate group-hover:text-red-500 transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {video.views} views •{" "}
                          {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  No videos available
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-300 text-lg">
            {channels.length === 0 
              ? "You haven't subscribed to any channels yet." 
              : "No subscriptions found in this category."
            }
          </p>
          {channels.length === 0 && (
            <Link 
              to="/explore" 
              className="inline-block mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Explore Channels
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;