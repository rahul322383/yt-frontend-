

/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../utils/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const SubscriptionButton = ({ channelId, isOwnChannel = false }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isLoggedIn = auth.isAuthenticated;
 
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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
    if (!isLoggedIn) {
      toast.error("Please login to subscribe to channels");
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await API.post(`/users/subscribe/${channelId}`);
      if (res.data.success) {
        const subscribed = !isSubscribed;
        setIsSubscribed(subscribed);
        setNotificationsOn(false);
        setSubscriberCount((prev) => (subscribed ? prev + 1 : Math.max(0, prev - 1)));
        
        if (subscribed) {
          toast.success("Subscribed to channel");
        } else {
          toast.success("Unsubscribed from channel");
          setShowDropdown(false);
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsSubscribed(true);
        toast.success("Already subscribed to this channel");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle bell notifications
  const handleBellToggle = async (option) => {
    if (!isLoggedIn) {
      toast.error("Please login to manage notifications");
      return;
    }
    
    if (!isSubscribed) return;

    setIsLoading(true);
    try {
      const res = await API.post(`/users/subscribe/notify-toggle/${channelId}`, { option });
      setNotificationsOn(res.data?.data?.notifications || false);
      setNotifyOption(option);
      
      if (option === "all") {
        toast.success("Notifications enabled");
      } else {
        toast.success("Notifications disabled");
      }
    } catch (err) {
      console.warn(err);
      toast.error("Could not update notifications");
    } finally {
      setIsLoading(false);
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

      {/* Subscribe button */}
      <div className="relative flex items-center gap-2">
        <button
          onClick={handleToggleSubscribe}
          disabled={isLoading}
          className={`px-4 py-1.5 rounded-full font-medium text-sm flex items-center justify-center gap-1 transition-all duration-200
            ${isSubscribed
              ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-700"}
            ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
          ) : isSubscribed ? (
            "Subscribed"
          ) : (
            "Subscribe"
          )}
        </button>

        {/* Notification bell button (only shown when subscribed) */}
        {isSubscribed && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isLoading}
              className={`p-1.5 rounded-full transition-colors ${
                notificationsOn 
                  ? "text-blue-500 bg-blue-100 dark:bg-blue-900/30" 
                  : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              } ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
            </button>

            {/* Notification dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden"
                >
      <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
              Notifications
            </div>

            <button
              onClick={() => handleBellToggle("all")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                notifyOption === "all"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              All notifications
            </button>

            <button
              onClick={() => handleBellToggle("personalized")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                notifyOption === "personalized"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Personalized
            </button>

            <button
              onClick={() => handleBellToggle("none")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                notifyOption === "none"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              None
            </button>
         <button
  className="w-full text-left px-3 py-2 mt-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
  onClick={() => {
    handleToggleSubscribe();
    setShowDropdown(false);
  }}
>
  Unsubscribe
</button>

          </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tooltip for non-logged in users */}
        <AnimatePresence>
          {!isLoggedIn && showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10"
            >
              Login to subscribe
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubscriptionButton;