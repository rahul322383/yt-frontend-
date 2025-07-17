"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axiosInstance.jsx";
import "../../../index.css";

const SubscribedChannelsList = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchSubscribedChannels = async () => {
    try {
      const { data } = await API.get("/users/me");
      const channelId = data?.data?.channelId;
      const res = await API.get(`/users/subscribe/subscribed/${channelId}`);
      const fetchedChannels = res.data?.data?.channels || [];
      setChannels(fetchedChannels);
    } catch (error) {
      console.error("Failed to fetch subscribed channels", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribedChannels();
  }, []);

  const filtered = channels.filter((ch) =>
    ch.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Subscribed Channels ({channels.length})
      </h3>

      <input
        type="text"
        placeholder="Search channels..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
      />

      {loading ? (
        <SkeletonLoader count={5} />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No subscriptions found.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((ch) => (
            <li
              key={ch._id}
              onClick={() => navigate(`/channel/${ch.channelId}`)}
              className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer"
            >
              <img
                src={ch.avatar || "/default-avatar.png"}
                alt={ch.username}
                className="w-10 h-10 rounded-full object-cover"
              />

              <h3 className="font-medium text-lg">{ch.username}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Intl.NumberFormat("en-IN").format(ch.subscriberCount)} subscribers
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SubscribedChannelsList;

// Skeleton Loader Component
const SkeletonLoader = ({ count = 3 }) => (
  <ul className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <li key={i} className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded" />
      </li>
    ))}
  </ul>
);
