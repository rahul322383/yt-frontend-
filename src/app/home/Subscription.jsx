
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
        (channel) => channel.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredChannels(filtered);
    }
  }, [selectedCategory, channels]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">📺 Subscribed Channels</h1>
        <div className="flex gap-3 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm border ${
                selectedCategory === cat
                  ? "bg-red-500 text-white"
                  : "bg-white dark:bg-gray-800 dark:text-white text-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Sort Dropdown UI (not functional yet) */}
      {/* <div className="mb-4 text-sm text-right">
        <select className="px-3 py-1 border rounded-md dark:bg-gray-700 dark:text-white">
          <option value="latest">Sort by Latest</option>
          <option value="favorites">Sort by Favorites</option>
        </select>
      </div> */}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredChannels.map((channel) => (
            <Link
              to={`/channel/${channel.channelId}`}
              key={channel.channelId}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-4 rounded-xl shadow-sm flex items-center gap-4 transition-all"
            >
              <img
                src={channel.avatar || "/default-avatar.png"}
                alt={channel.username}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium text-lg">{channel.username}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">@{channel.channelId}</p>
                {/* Future stats */}
                {/* <p className="text-xs text-gray-500">12 videos · 5.4k subs</p> */}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-300">No subscriptions found in this category.</p>
      )}
    </div>
  );
};

export default Subscriptions;
