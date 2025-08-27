/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../utils/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SubscriptionButton = ({ channelId, isOwnChannel = false }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isLoggedIn = auth.isAuthenticated;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false); // ON/OFF
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifyOption, setNotifyOption] = useState("all");

  // Fetch subscription + notifications + subscriber count
  const fetchSubscriptionData = async () => {
    try {
      const countRes = await API.get(`/users/subscribe/channel/${channelId}`);
      setSubscriberCount(countRes.data?.data?.total || 0);

      if (isLoggedIn) {
        const statusRes = await API.get(`/users/subscribe/status/${channelId}`);
        setIsSubscribed(statusRes.data?.data?.subscribed || false);
        setNotificationsOn(statusRes.data?.data?.notifications || false);
        setNotifyOption(statusRes.data?.data?.notifications ? "all" : "none");
      }
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
    }
  };

  useEffect(() => {
    if (channelId) fetchSubscriptionData();
  }, [channelId, isLoggedIn]);

  // Toggle subscribe/unsubscribe
  const handleToggleSubscribe = async () => {
    if (!isLoggedIn) return navigate("/login");
    setIsLoading(true);

    try {
      const res = await API.post(`/users/subscribe/${channelId}`);
      if (res.data.success) {
        const subscribed = !isSubscribed;
        setIsSubscribed(subscribed);
        setNotificationsOn(false); // default OFF
        setSubscriberCount((prev) => (subscribed ? prev + 1 : Math.max(0, prev - 1)));
        setToastMessage(subscribed ? "✅ Subscribed" : "❌ Unsubscribed");
        if (!subscribed) setShowDropdown(false);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsSubscribed(true);
        setToastMessage("✅ Already subscribed");
      } else {
        setToastMessage("⚠️ Something went wrong");
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  // Toggle bell notifications (accepts ON/OFF)
  const handleBellToggle = async (option) => {
    if (!isLoggedIn) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
      return;
    }
    if (!isSubscribed) return;

    setIsLoading(true);
    try {
      const res = await API.post(`/users/subscribe/notify-toggle/${channelId}`, { option });
      setNotificationsOn(res.data?.data?.notifications || false);
      setNotifyOption(option);
      setToastMessage(res.data.message);
    } catch (err) {
      console.warn(err);
      setToastMessage("⚠️ Could not update notifications");
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(""), 2500);
    }
  };

  const formatCount = (count) => {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
    if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
    return count.toString();
  };

  if (isOwnChannel) return null;

  return (
    <div className="relative flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {formatCount(subscriberCount)} subscribers
      </span>

      <div className="relative flex items-center gap-1">
        <button
          onClick={handleToggleSubscribe}
          onMouseEnter={() => !isLoggedIn && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={isLoading}
          className={`px-4 py-1.5 rounded-full font-medium text-sm flex items-center justify-center gap-1 transition-all duration-200
            ${isSubscribed
              ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500"
              : "bg-red-600 text-white hover:bg-red-700"}
            ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {isSubscribed ? "Subscribed" : "Subscribe"}
        </button>

        {/* Bell dropdown */}
        {isSubscribed && (
          <div
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            className="relative"
          >
            <button className={`px-2 ${notificationsOn ? "text-red-600" : "text-gray-500"}`}>
              🔔
            </button>

            {showDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm font-medium">Notifications</div>
                <button
                  onClick={() => handleBellToggle("all")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center ${
                    notifyOption === "all" ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🔔 All {notifyOption === "all" && "✅"}
                </button>
                <button
                  onClick={() => handleBellToggle("personalized")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center ${
                    notifyOption === "personalized" ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🎯 Personalized {notifyOption === "personalized" && "✅"}
                </button>
                <button
                  onClick={() => handleBellToggle("none")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center ${
                    notifyOption === "none" ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  🚫 None {notifyOption === "none" && "✅"}
                </button>

                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleToggleSubscribe}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    ❌ Unsubscribe
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tooltip for guests */}
        {showTooltip && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
            Sign in to subscribe
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-md z-50 text-sm"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionButton;
