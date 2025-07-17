/* eslint-disable no-unused-vars */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaThumbsUp,
  FaCommentDots,
  FaVideo,
  FaBellSlash,
  FaExclamationCircle,
} from "react-icons/fa";
import API from "../../utils/axiosInstance.jsx";

const NotificationCard = ({ notification }) => {
  const { type, message, videoId, createdAt, read } = notification;

  const getIcon = () => {
    switch (type) {
      case "like":
        return <FaThumbsUp className="text-blue-500" />;
      case "comment":
        return <FaCommentDots className="text-green-500" />;
      case "upload":
        return <FaVideo className="text-red-500" />;
      default:
        return <FaBellSlash className="text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={videoId ? `/video/${videoId}` : "#"}
        className={`flex items-start gap-4 p-4 rounded-2xl shadow-md hover:shadow-xl transition-all border group ${
          !read
            ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            : "bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600"
        }`}
        aria-label={`Notification: ${message}`}
      >
        <div className="text-xl mt-1 group-hover:scale-105 transition-transform">
          {getIcon()}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-zinc-800 dark:text-white font-medium">
            {message}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/notifications");

      if (res?.data?.success) {
        setNotifications(res.data.data || []);
      } else {
        throw new Error(res?.data?.message || "Failed to fetch notifications.");
      }
    } catch (err) {
      console.error("Notification error:", err);
      const errorMsg =
        err?.message || "Failed to load notifications. Please try again later.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/mark-read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Automatically mark all notifications as read on page load
  useEffect(() => {
    notifications.forEach((note) => {
      if (!note.read) {
        markAsRead(note._id);
      }
    });
  }, [notifications]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-950 via-black to-zinc-900 px-4 py-10 md:px-10 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-center mb-8"
      >
        Your Notifications
      </motion.h1>

      {loading ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-zinc-400"
        >
          Loading notifications...
        </motion.p>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center flex flex-col items-center gap-2 text-red-400"
        >
          <FaExclamationCircle className="text-3xl" />
          <p>{error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </motion.div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center flex flex-col items-center gap-2 text-zinc-400"
        >
          <FaBellSlash className="text-3xl" />
          <p>No new notifications.</p>
        </motion.div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {notifications.map((note) => (
            <div
              key={note._id}
              onClick={() => !note.read && markAsRead(note._id)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !note.read) markAsRead(note._id);
              }}
            >
              <NotificationCard notification={note} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
