/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaThumbsUp,
  FaCommentDots,
  FaVideo,
  FaBellSlash,
  FaExclamationCircle,
  FaBell,
  FaTrash,
  FaCheck,
  FaSync
} from "react-icons/fa";
import API from "../../utils/axiosInstance.jsx";

const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const { type, message, videoId, createdAt, read } = notification;

  const getIcon = () => {
    switch (type) {
      case "like":
        return <FaThumbsUp className="text-blue-500" />;
      case "comment":
        return <FaCommentDots className="text-green-500" />;
      case "upload":
        return <FaVideo className="text-purple-500" />;
      default:
        return <FaBell className="text-yellow-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "like":
        return "Like";
      case "comment":
        return "Comment";
      case "upload":
        return "New Video";
      default:
        return "Notification";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.2 }}
      className={`relative group rounded-xl overflow-hidden ${
        !read ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div
        className={`relative flex items-start gap-4 p-4 ${
          !read
            ? "bg-white dark:bg-zinc-800"
            : "bg-zinc-50 dark:bg-zinc-700/50"
        }`}
      >
        <div className="flex-shrink-0 p-2 rounded-lg bg-white/10 dark:bg-black/20">
          <div className="text-xl">{getIcon()}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {getTypeLabel()}
            </span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(notification._id);
                  }}
                  className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
                  aria-label="Mark as read"
                >
                  <FaCheck size={12} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification._id);
                }}
                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                aria-label="Delete notification"
              >
                <FaTrash size={12} />
              </button>
            </div>
          </div>

          <Link
            to={videoId ? `/video/${videoId}` : "#"}
            className="block mt-1"
            onClick={(e) => !read && e.preventDefault()}
          >
            <p className="text-sm font-medium text-zinc-800 dark:text-white line-clamp-2">
              {message}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {new Date(createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/notifications");

      if (res?.data?.success) {
        const fetchedNotifications = res.data.data || [];
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
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
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => 
        prev - (notifications.find(n => n._id === id)?.read ? 0 : 1
      ));
    } catch (err) {
      console.error("Error deleting notification:", err);
     
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-8 md:px-8 lg:px-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
            <p className="text-zinc-400">
              {unreadCount > 0 
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 rounded-full transition"
              >
                <FaCheck size={12} />
                Mark all read
              </button>
            )}
            <button
              onClick={fetchNotifications}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 rounded-full transition"
            >
              <FaSync size={12} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-zinc-400">Loading notifications...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center flex flex-col items-center gap-4 py-12"
          >
            <div className="p-4 bg-red-900/20 rounded-full">
              <FaExclamationCircle className="text-3xl text-red-400" />
            </div>
            <p className="text-red-400 max-w-md">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FaSync /> Try Again
            </button>
          </motion.div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center flex flex-col items-center gap-4 py-12"
          >
            <div className="p-4 bg-zinc-800 rounded-full">
              <FaBellSlash className="text-3xl text-zinc-400" />
            </div>
            <p className="text-zinc-400">No notifications yet</p>
            <p className="text-zinc-500 text-sm max-w-md">
              You'll see notifications here when someone likes, comments on, or shares your videos.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((note) => (
                <NotificationCard
                  key={note._id}
                  notification={note}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationPage;