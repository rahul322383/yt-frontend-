/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaThumbsUp,
  FaCommentDots,
  FaVideo,
  FaBell,
  FaTrash,
  FaCheck,
  FaSync,
  FaTimes,
  FaExclamationCircle
} from "react-icons/fa";
import API from "../../utils/axiosInstance.jsx";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext.jsx";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";
const socket = io(SOCKET_URL, { autoConnect: false });

const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const { type, message, videoId, createdAt, read = false, sender } = notification;

  const getIcon = () => {
    switch (type) {
      case "like": return <FaThumbsUp className="text-blue-500" size={16} />;
      case "comment": return <FaCommentDots className="text-green-500" size={16} />;
      case "upload": return <FaVideo className="text-purple-500" size={16} />;
      default: return <FaBell className="text-yellow-500" size={16} />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "like": return "Like";
      case "comment": return "Comment";
      case "upload": return "New Video";
      default: return "Notification";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "like": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
      case "comment": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
      case "upload": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200";
      default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.2 }}
      className={`relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${!read ? "ring-1 ring-blue-400 shadow-sm" : ""} transition-all duration-200 hover:shadow-md`}
    >
      <div className={`relative flex items-start gap-4 p-4 ${!read ? "bg-blue-50/30 dark:bg-blue-900/10" : "bg-white dark:bg-gray-800"} transition-colors duration-200`}>
        
        <div className="flex-shrink-0">
          {sender?.avatar ? (
            <img src={sender.avatar} alt={sender.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getTypeColor().split(' ')[0]} bg-opacity-30`}>
              {getIcon()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getTypeColor()}`}>
              {getTypeLabel()}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {!read && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMarkRead(notification._id); }}
                  className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-colors"
                  title="Mark as read"
                >
                  <FaCheck size={14} />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(notification._id); }}
                className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                title="Delete notification"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>

          <Link to={videoId ? `/video/${videoId}` : "#"} className="block" onClick={(e) => !videoId && e.preventDefault()}>
            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
              {sender ? <strong>{sender.name}</strong> : "System"} {message}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(createdAt).toLocaleString("en-US", {
                month: "short", day: "numeric", year: "numeric",
                hour: "2-digit", minute: "2-digit"
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
  const [refreshing, setRefreshing] = useState(false);
  
  const { auth, logout } = useContext(AuthContext);
  const { isAuthenticated, user } = auth;

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (!isAuthenticated) return;

      if (isRefresh) setRefreshing(true); else setLoading(true);
      setError(null);

      const res = await API.get("/notifications");
      if (res?.data?.success) {
        const fetched = res.data.data || [];
        setNotifications(fetched);
        setUnreadCount(fetched.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) logout();
      else setError(err?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, logout]);

  // Socket.io connection and listener
  useEffect(() => {
    if (!isAuthenticated) return;
    socket.auth = { userId: user?._id };
    socket.connect();

    socket.on("connect", () => {
      socket.emit("register", user?._id);
    });

    socket.on("new-notification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast.info(`New notification: ${notification.message}`);
    });

    fetchNotifications();

    return () => {
      socket.off("new-notification");
      socket.disconnect();
    };
  }, [isAuthenticated, user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.post(`/notifications/${id}/mark-read`);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount(prev => prev - 1);
    } catch { toast.error("Failed to mark notification as read"); }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deleted && !deleted.read) setUnreadCount(prev => prev - 1);
    } catch { toast.error("Failed to delete notification"); }
  };

  const markAllAsRead = async () => {
    try {
      await API.post("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { toast.error("Failed to mark all notifications as read"); }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6">
      <div className="max-w-3xl mx-auto text-center py-12">
        <FaExclamationCircle className="text-yellow-500 text-4xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your notifications</p>
        <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Log In</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && <button onClick={markAllAsRead} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><FaCheck size={14} /> Mark all read</button>}
            <button onClick={() => fetchNotifications(true)} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg"><FaSync size={14} className={refreshing ? "animate-spin" : ""} /> Refresh</button>
          </div>
        </div>

        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-3"><FaExclamationCircle className="text-red-500" /> <p className="text-red-800 dark:text-red-200 text-sm">{error}</p></div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 dark:hover:text-red-300"><FaTimes size={16} /></button>
        </motion.div>}

        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
          </motion.div>
        ) : notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-500 dark:text-gray-400">No notifications yet.</motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map(note => <NotificationCard key={note._id} notification={note} onMarkRead={markAsRead} onDelete={deleteNotification} />)}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationPage;
