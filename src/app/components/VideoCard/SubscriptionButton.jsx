/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../utils/axiosInstance.jsx";
import { useAuth } from"../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const SubscriptionButton = ({
  channelId,
  isSubscribedInitially = false,
  subscriberCount = 0,
  isNotifiedInitially = false,
}) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isLoggedIn = auth.isAuthenticated;

  const [isSubscribed, setIsSubscribed] = useState(isSubscribedInitially);
  const [isNotified, setIsNotified] = useState(isNotifiedInitially);
  const [displayCount, setDisplayCount] = useState(subscriberCount);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Fetch actual count from backend
  const fetchSubscriberCount = async () => {
    try {
      const res = await API.get(`/users/subscribe/channel/${channelId}`);
      const count = res.data?.data?.total || 0;
      setDisplayCount(count);
    } catch (err) {
      console.error("Error fetching subscriber count:", err);
    }
  };

  useEffect(() => {
    setIsSubscribed(isSubscribedInitially);
    setIsNotified(isNotifiedInitially);
    setDisplayCount(subscriberCount);

    if (channelId) {
      fetchSubscriberCount();
    }
  }, [isSubscribedInitially, isNotifiedInitially, subscriberCount, channelId]);

  const handleToggleSubscribe = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!channelId || isLoading) return;

    setIsLoading(true);
    try {
      const res = await API.post(`/users/subscribe/${channelId}`);
      const { success, data } = res.data;

      if (success) {
        const newState = !isSubscribed;
        setIsSubscribed(newState);
        setIsNotified(data?.notifications || false);
        setToastMessage(newState ? "✅ Subscribed" : "❌ Unsubscribed");

        // Always fetch accurate count from backend
        await fetchSubscriberCount();
      } else {
        setToastMessage("⚠️ Subscription failed");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setToastMessage("⚠️ Something went wrong");
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(""), 3000);
      setShowDropdown(false);
    }
  };

  const handleBellToggle = async () => {
    if (!isSubscribed) return;

    const newNotify = !isNotified;
    setIsLoading(true);

    try {
      const res = await API.post(`/users/subscribe/notify-toggle/${channelId}`);
      if (res.data.success) {
        setIsNotified(newNotify);
        setToastMessage(newNotify ? "🔔 Notifications ON" : "🔕 Notifications OFF");
      } else {
        setToastMessage("⚠️ Could not update notifications");
      }
    } catch (err) {
      console.warn("Bell toggle failed:", err);
      setToastMessage("⚠️ Could not update notifications");
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(""), 2500);
      setShowDropdown(false);
    }
  };

  const formatSubs = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  return (
    <div className="relative flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {formatSubs(displayCount)} subscribers
      </span>

      <div className="relative flex items-center">
        {/* Main Subscribe/Subscribed Button */}
        <div className="relative">
          <button
            onClick={isSubscribed ? () => setShowDropdown(!showDropdown) : handleToggleSubscribe}
            disabled={isLoading}
            className={`relative px-4 py-1.5 rounded-l-full font-medium text-sm transition-all duration-200 flex items-center gap-1
              ${
                isSubscribed
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  : "bg-red-600 text-white hover:bg-red-700"
              }
              ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
            `}
            onMouseEnter={() => !isLoggedIn && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : isSubscribed ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Subscribed
              </>
            ) : (
              "Subscribe"
            )}
          </button>

          {/* Tooltip for non-logged in users */}
          {!isLoggedIn && showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Sign in to subscribe
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
            </div>
          )}
        </div>

        {/* Dropdown toggle button (only shown when subscribed and logged in) */}
        {isSubscribed && isLoggedIn && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isLoading}
            className={`px-2 py-1.5 rounded-r-full font-medium text-sm transition-all duration-200
              bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600
              ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
              border-l border-gray-300 dark:border-gray-600
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Dropdown menu (similar to YouTube) */}
        {isSubscribed && showDropdown && isLoggedIn && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Notifications</div>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setIsNotified(true);
                  handleBellToggle();
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3
                  ${isNotified ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}
                  hover:bg-gray-100 dark:hover:bg-gray-700
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                All
              </button>
              <button
                onClick={() => {
                  setIsNotified(false);
                  handleBellToggle();
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3
                  ${!isNotified ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}
                  hover:bg-gray-100 dark:hover:bg-gray-700
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
                Personalized
              </button>
              <button
                onClick={() => {
                  setIsNotified(false);
                  handleBellToggle();
                }}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                None
              </button>
            </div>
            <div className="py-1 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleToggleSubscribe}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Unsubscribe
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-md z-50 text-sm flex items-center gap-2"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default SubscriptionButton;