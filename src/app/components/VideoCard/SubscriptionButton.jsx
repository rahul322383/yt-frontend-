/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../utils/axiosInstance.jsx";

const SubscriptionButton = ({
  channelId,
  isSubscribedInitially = false,
  subscriberCount = 0,
  isNotifiedInitially = false,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(isSubscribedInitially);
  const [isNotified, setIsNotified] = useState(isNotifiedInitially);
  const [displayCount, setDisplayCount] = useState(subscriberCount);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setIsSubscribed(isSubscribedInitially);
    setIsNotified(isNotifiedInitially);
    setDisplayCount(subscriberCount);
  }, [isSubscribedInitially, isNotifiedInitially, subscriberCount, channelId]);

  const handleToggleSubscribe = async () => {
    if (!channelId || isLoading) return;

    setIsLoading(true);
    try {
      const res = await API.post(`/users/subscribe/${channelId}`);
      const { success, data } = res.data;

      if (success) {
        const newState = !isSubscribed;
        setIsSubscribed(newState);
        setDisplayCount((prev) =>
          newState ? prev + 1 : Math.max(0, prev - 1)
        );
        setIsNotified(data?.notifications || false);
        setToast(newState ? "✅ Subscribed" : "❌ Unsubscribed");
      } else {
        setToast("⚠️ Subscription failed");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setToast("⚠️ Something went wrong");
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(""), 3000);
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
        setToast(newNotify ? "🔔 Notifications ON" : "🔕 Notifications OFF");
        console.log(res)
      } else {
        setToast("⚠️ Could not update notifications");
      }
    } catch (err) {
      console.warn("Bell toggle failed:", err);
      setToast("⚠️ Could not update notifications");
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(""), 2500);
      setShowDropdown(false);
    }
  };

  const formatSubs = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Subscriber count */}
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {formatSubs(displayCount)} subscribers
      </span>

      {/* Subscribe Button with Dropdown */}
      <div className="relative group">
        <button
          onClick={isSubscribed ? () => setShowDropdown(!showDropdown) : handleToggleSubscribe}
          disabled={isLoading}
          className={`relative px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-1
            ${
              isSubscribed
                ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                : "bg-red-600 text-white hover:bg-red-700"
            }
            ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
          `}
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

        {/* Dropdown menu for subscribed state */}
        {isSubscribed && showDropdown && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleToggleSubscribe}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Unsubscribe
            </button>
            <button
              onClick={handleBellToggle}
              disabled={isLoading}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              {isNotified ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 13h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6zM6 16a4 4 0 008 0H6z" />
                  </svg>
                  Turn off notifications
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 13h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6zm-2 14a2 2 0 104 0H8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Turn on notifications
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Standalone Bell Button (visible when notifications are on) */}
      {isSubscribed && isNotified && (
        <button
          onClick={handleBellToggle}
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title="Turn off notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-yellow-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 13h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6zM6 16a4 4 0 008 0H6z" />
          </svg>
        </button>
      )}

      {/* Toast message */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-md z-50 text-sm flex items-center gap-2"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionButton;