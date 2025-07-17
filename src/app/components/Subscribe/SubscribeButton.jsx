import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Bell, CheckCircle, Loader2 } from "lucide-react";

const SubscribeButton = ({ channelId, currentUserId }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch subscriber data
  const checkSubscribers = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/subscribers/user/${currentUserId}/subscribers`
      );
      const subscribedChannelIds = data?.data?.channels?.map((ch) => ch._id);
      setIsSubscribed(subscribedChannelIds.includes(channelId));

      const res = await axios.get(`/api/v1/subscribers/channel/${channelId}/count`);
      setSubscriberCount(res?.data?.data?.count || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch subscription data");
    }
  };

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    setIsSubscribed((prev) => !prev); // Optimistic toggle
    setSubscriberCount((prev) => prev + (isSubscribed ? -1 : 1));

    try {
      const res = await axios.post(`/api/v1/subscribers/subscribe/${channelId}`);
      toast.success(res?.data?.message || "Subscription updated");
    } catch (err) {
      setIsSubscribed((prev) => !prev); // Revert on error
      setSubscriberCount((prev) => prev + (isSubscribed ? 1 : -1));
      toast.error(err?.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId && currentUserId !== channelId) {
      checkSubscribers();
    }
  }, [channelId, currentUserId]);

  if (!currentUserId || currentUserId === channelId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex flex-col items-center"
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleToggle}
        disabled={loading}
        title={isSubscribed ? "Unsubscribe" : "Subscribe"}
        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition ${
          isSubscribed
            ? "bg-gray-300 text-gray-800 hover:bg-gray-400"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing</span>
          </>
        ) : (
          <>
            {isSubscribed ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Subscribed</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Subscribe</span>
              </>
            )}
          </>
        )}
      </motion.button>

      {/* Subscriber Count */}
      <span className="text-xs mt-1 text-gray-500">
        {subscriberCount.toLocaleString()} subscriber{subscriberCount !== 1 ? "s" : ""}
      </span>
    </motion.div>
  );
};

export default SubscribeButton;
