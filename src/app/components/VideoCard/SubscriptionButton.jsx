/* eslint-disable no-unused-vars */

"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [notifyOption, setNotifyOption] = useState("none");
  const [loadingAction, setLoadingAction] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);

  // Format count for display
  const formatCount = useCallback((count) => {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
    if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
    return count.toString();
  }, []);

  // Fetch subscription data
  const fetchSubscriptionData = useCallback(async () => {
    if (!channelId) return;
    
    try {
      setError(null);
      const [countRes, statusRes] = await Promise.all([
        API.get(`/users/subscribe/channel/${channelId}`),
        isLoggedIn ? API.get(`/users/subscribe/status/${channelId}`) : Promise.resolve(null),
      ]);

      setSubscriberCount(countRes.data?.data?.total || 0);

      if (statusRes) {
        const { subscribed = false, notifications = "none" } = statusRes.data?.data || {};
        setIsSubscribed(subscribed);
        setNotifyOption(notifications);
      }
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
      setError("Failed to load subscription data");
    }
  }, [channelId, isLoggedIn]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Subscribe/unsubscribe handler
  const handleToggleSubscribe = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to subscribe to channels");
      navigate("/login");
      return;
    }

    setLoadingAction("subscribe");
    try {
      const res = await API.post(`/users/subscribe/${channelId}`);
      if (res.data.success) {
        const subscribed = !isSubscribed;
        setIsSubscribed(subscribed);
        setNotifyOption("none");
        setSubscriberCount((prev) => (subscribed ? prev + 1 : Math.max(0, prev - 1)));
        setShowDropdown(false);

        toast.success(subscribed ? "Subscribed to channel" : "Unsubscribed from channel");
      }
    } catch (err) {
      console.error("Subscription action failed:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingAction(null);
    }
  };

  // Toggle bell notifications
  const handleBellToggle = async (option) => {
    if (!isLoggedIn) {
      toast.error("Please login to manage notifications");
      navigate("/login");
      return;
    }
    
    if (!isSubscribed) return;

    setLoadingAction("notify");
    try {
      await API.post(`/users/subscribe/notify-toggle/${channelId}`, { option });
      setNotifyOption(option);

      const message = 
        option === "all" ? "All notifications enabled" :
        option === "personalized" ? "Personalized notifications set" :
        "Notifications disabled";
      
      toast.success(message);
    } catch (err) {
      console.error("Notification update failed:", err);
      toast.error(err.response?.data?.message || "Could not update notifications");
    } finally {
      setLoadingAction(null);
    }
  };

  // Don't render if it's the user's own channel
  if (isOwnChannel) return null;

  // Notification options with labels
  const notificationOptions = [
    { value: "all", label: "All notifications" },
    { value: "personalized", label: "Personalized" },
    { value: "none", label: "None" }
  ];

  return (
    <div className="relative flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {formatCount(subscriberCount)} subscribers
      </span>

      {/* Subscribe button */}
      <button
        onClick={handleToggleSubscribe}
        disabled={loadingAction === "subscribe"}
        aria-label={isSubscribed ? "Unsubscribe" : "Subscribe"}
        aria-busy={loadingAction === "subscribe"}
        className={`px-4 py-1.5 rounded-full font-medium text-sm flex items-center justify-center gap-1 transition-all duration-200
          ${isSubscribed
            ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            : "bg-red-600 text-white hover:bg-red-700"}
          ${loadingAction === "subscribe" ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {loadingAction === "subscribe" ? (
          <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" aria-hidden="true"></div>
        ) : isSubscribed ? (
          "Subscribed"
        ) : (
          "Subscribe"
        )}
      </button>

      {/* Bell button + dropdown */}
      {isSubscribed && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loadingAction === "notify"}
            aria-label="Notification settings"
            aria-haspopup="true"
            aria-expanded={showDropdown}
            aria-busy={loadingAction === "notify"}
            className={`p-1.5 rounded-full transition-colors ${
              notifyOption !== "none"
                ? "text-blue-500 bg-blue-100 dark:bg-blue-900/30"
                : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            } ${loadingAction === "notify" ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <span aria-hidden="true">🔔</span>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden"
                role="menu"
              >
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                    Notifications
                  </div>

                  {notificationOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleBellToggle(option.value)}
                      role="menuitemradio"
                      aria-checked={notifyOption === option.value}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        notifyOption === option.value
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}

                  <button
                    className="w-full text-left px-3 py-2 mt-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
                    onClick={handleToggleSubscribe}
                    role="menuitem"
                  >
                    Unsubscribe
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {error && (
        <div className="absolute -bottom-6 left-0 text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default SubscriptionButton;