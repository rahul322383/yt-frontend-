import { useEffect, useState } from "react";
import API from "../../../utils/axiosInstance.jsx";
import { formatDistanceToNow } from "date-fns";
import "../../../index.css";
import { Link, useParams } from "react-router-dom";

const SubscribersList = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelId = useParams().channelId;

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await API.get(`/users/subscribe/channel/${channelId}`);
        setSubscribers(data?.data?.subscribers || []);
      } catch (err) {
        console.error("Error fetching subscribers:", err);
        setError("Failed to load subscribers.");
      } finally {
        setLoading(false);
      }
    };

    if (channelId) fetchSubscribers();
  }, [channelId]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Subscribers ({subscribers.length})
      </h3>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="w-24 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : subscribers.length === 0 ? (
        <p className="text-sm text-gray-500">No subscribers yet.</p>
      ) : (
        <ul className="space-y-3">
          {subscribers.map(({ _id, subscriber, subscribedAt }) => (
            <li
              key={_id}
              className="flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded-lg transition"
              title={`Channel ID: ${subscriber?.channelId || "unknown"}`}
            >
              <Link to={`/channel/${subscriber?.channelId}`} className="shrink-0">
                <img
                  src={subscriber?.avatar || "/default-avatar.png"}
                  alt={subscriber?.username || "User"}
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                  className="w-10 h-10 rounded-full object-cover hover:scale-105 transition duration-200"
                />
              </Link>
              <div className="flex flex-col text-sm sm:text-base">
                <Link
                  to={`/channel/${subscriber?.channelId}`}
                  className="font-medium text-gray-800 dark:text-white hover:underline"
                >
                  {subscriber?.username || "Unknown User"}
                </Link>
                <span className="text-xs text-gray-500">
                  Subscribed {formatDistanceToNow(new Date(subscribedAt), { addSuffix: true })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SubscribersList;
