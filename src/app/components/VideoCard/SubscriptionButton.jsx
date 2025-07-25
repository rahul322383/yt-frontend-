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
      const { success } = res.data;

      if (success) {
        const newState = !isSubscribed;
        setIsSubscribed(newState);
        setDisplayCount((prev) =>
          newState ? prev + 1 : Math.max(0, prev - 1)
        );
        setToast(newState ? "✅ Subscribed" : "❌ Unsubscribed");

        // Turn off bell when unsubscribed
        if (!newState) setIsNotified(false);
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
    setIsNotified(newNotify);
    setToast(newNotify ? "🔔 Notifications ON" : "🔕 Notifications OFF");

    try {
      await API.post(`/users/subscribe/notify-toggle/${channelId}`); 
    } catch (err) {
      console.warn("Bell toggle failed:", err);
      setIsNotified(!newNotify); // Revert state on fail
      setToast("⚠️ Could not update notifications");
    }
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Subscriber count */}
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {new Intl.NumberFormat("en-IN").format(displayCount)} subscribers
      </span>

      {/* Subscribe/Unsubscribe Button */}
      <button
        onClick={handleToggleSubscribe}
        disabled={isLoading}
        className={`relative px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200
          ${
            isSubscribed
              ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-700"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span className="relative z-10 flex items-center gap-1">
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
        </span>
      </button>

      {/* 🔔 Bell toggle */}
      {isSubscribed && (
        <button
          onClick={handleBellToggle}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title={isNotified ? "Turn off notifications" : "Turn on notifications"}
        >
          {isNotified ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 13h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6zM6 16a4 4 0 008 0H6z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 13h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6zm-2 14a2 2 0 104 0H8z"
                clipRule="evenodd"
              />
            </svg>
          )}
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
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-md z-50 text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionButton;
