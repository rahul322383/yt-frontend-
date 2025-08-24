
"use client";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/axiosInstance";

const categories = ["All", "Gaming", "Vlog", "Education", "Music", "Tech"];

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      try {
        const { data } = await API.get("/users/me");
        const channelId = data?.data?.channelId;
        const res = await API.get(`/users/subscribe/subscribed/${channelId}`);
        const fetchedChannels = res.data.data.channels || [];
        setChannels(fetchedChannels);
        setFilteredChannels(fetchedChannels);
      } catch (error) {
        console.error("Failed to fetch subscribed channels", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribedChannels();
  }, []);

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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">📺 Subscribed Channels</h1>
      </div>

      {/* Horizontal Scroll Category Bar */}
      <div className="flex overflow-x-auto md:flex-wrap gap-2 md:gap-3 py-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-700">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-200 border
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
        <select className="px-3 py-1 border rounded-md dark:bg-gray-700 dark:text-white">
          <option value="latest">Sort by Latest</option>
          <option value="favorites">Sort by Favorites</option>
        </select>
      </div>

      {/* Channel Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl animate-pulse flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-gray-400 dark:bg-gray-600" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-2/3"></div>
                <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredChannels.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredChannels.map((channel) => (
            <div
              key={channel._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4"
            >
              {/* Channel Header */}
              <Link
                to={`/channel/${channel._id}`}
                className="flex items-center gap-4 mb-4"
              >
                <img
                  src={channel.avatar || "/default-avatar.png"}
                  alt={channel.username}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-sm sm:text-base truncate">
                    {channel.username}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {channel.subscriberCount?.toLocaleString() || 0} subscribers
                  </p>
                </div>
              </Link>

              {/* Latest Videos Preview */}
              {channel.videos?.length > 0 && (
                <div className="space-y-3">
                  {channel.videos.slice(0, 2).map((video) => (
                    <Link
                      key={video._id}
                      to={`/video/${video._id}`}
                      className="flex items-center gap-3 group"
                    >
                      {/* Video thumbnail (first frame preview) */}
                      <video
                        src={video.videoUrl}
                        className="w-28 h-16 rounded-md object-cover flex-shrink-0 bg-black"
                        preload="metadata"
                        muted
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate group-hover:text-red-500">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {video.views} views •{" "}
                          {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-300 mt-6 text-center">
          No subscriptions found in this category.
        </p>
      )}
    </div>
  );
};

export default Subscriptions;
