// /* eslint-disable no-unused-vars */
// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   FaThumbsUp,
//   FaCommentDots,
//   FaVideo,
//   FaBellSlash,
//   FaExclamationCircle,
//   FaBell,
//   FaTrash,
//   FaCheck,
//   FaSync,
//   FaTimes
// } from "react-icons/fa";
// import API from "../../utils/axiosInstance.jsx";
// import { toast } from "react-toastify";

// const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
//   const { type, message, videoId, createdAt, read } = notification;

//   const getIcon = () => {
//     switch (type) {
//       case "like":
//         return <FaThumbsUp className="text-blue-500" size={16} />;
//       case "comment":
//         return <FaCommentDots className="text-green-500" size={16} />;
//       case "upload":
//         return <FaVideo className="text-purple-500" size={16} />;
//       default:
//         return <FaBell className="text-yellow-500" size={16} />;
//     }
//   };

//   const getTypeLabel = () => {
//     switch (type) {
//       case "like":
//         return "Like";
//       case "comment":
//         return "Comment";
//       case "upload":
//         return "New Video";
//       default:
//         return "Notification";
//     }
//   };

//   const getTypeColor = () => {
//     switch (type) {
//       case "like":
//         return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
//       case "comment":
//         return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
//       case "upload":
//         return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200";
//       default:
//         return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, x: -50 }}
//       transition={{ duration: 0.2 }}
//       className={`relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${
//         !read ? "ring-1 ring-blue-400 shadow-sm" : ""
//       } transition-all duration-200 hover:shadow-md`}
//     >
//       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
//       <div
//         className={`relative flex items-start gap-4 p-4 ${
//           !read
//             ? "bg-blue-50/30 dark:bg-blue-900/10"
//             : "bg-white dark:bg-gray-800"
//         } transition-colors duration-200`}
//       >
//         <div className={`flex-shrink-0 p-3 rounded-full ${getTypeColor().split(' ')[0]} bg-opacity-30`}>
//           {getIcon()}
//         </div>

//         <div className="flex-1 min-w-0">
//           <div className="flex justify-between items-start mb-2">
//             <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getTypeColor()}`}>
//               {getTypeLabel()}
//             </span>
//             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//               {!read && (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onMarkRead(notification._id);
//                   }}
//                   className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-colors"
//                   aria-label="Mark as read"
//                   title="Mark as read"
//                 >
//                   <FaCheck size={14} />
//                 </button>
//               )}
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDelete(notification._id);
//                 }}
//                 className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
//                 aria-label="Delete notification"
//                 title="Delete notification"
//               >
//                 <FaTrash size={14} />
//               </button>
//             </div>
//           </div>

//           <Link
//             to={videoId ? `/video/${videoId}` : "#"}
//             className="block"
//             onClick={(e) => !videoId && e.preventDefault()}
//           >
//             <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
//               {message}
//             </p>
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               {new Date(createdAt).toLocaleString("en-US", {
//                 month: "short",
//                 day: "numeric",
//                 year: "numeric",
//                 hour: "2-digit",
//                 minute: "2-digit"
//               })}
//             </p>
//           </Link>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// const NotificationPage = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchNotifications = useCallback(async (isRefresh = false) => {
//     try {
//       if (isRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }
//       setError(null);
//       const res = await API.get("/notifications");

//       if (res?.data?.success) {
//         const fetchedNotifications = res.data.data || [];
//         setNotifications(fetchedNotifications);
//         setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
//       } else {
//         throw new Error(res?.data?.message || "Failed to fetch notifications.");
//       }
//     } catch (err) {
//       console.error("Notification error:", err);
//       const errorMsg =
//         err?.response?.data?.message || err?.message || "Failed to load notifications. Please try again later.";
//       setError(errorMsg);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchNotifications();
//   }, [fetchNotifications]);

//   const markAsRead = async (id) => {
//     try {
//       await API.patch(`/notifications/${id}/mark-read`);
//       setNotifications(prev =>
//         prev.map(n => (n._id === id ? { ...n, read: true } : n))
//       );
//       setUnreadCount(prev => prev - 1);
//     } catch (err) {
//       console.error("Error marking as read:", err);
//       toast.error("Failed to mark notification as read");
//     }
//   };

//   const deleteNotification = async (id) => {
//     try {
//       await API.delete(`/notifications/${id}`);
//       const deletedNotification = notifications.find(n => n._id === id);
//       setNotifications(prev => prev.filter(n => n._id !== id));
//       if (deletedNotification && !deletedNotification.read) {
//         setUnreadCount(prev => prev - 1);
//       }
//     } catch (err) {
//       console.error("Error deleting notification:", err);
//       toast.error("Failed to delete notification");
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       await API.patch("/notifications/mark-all-read");
//       setNotifications(prev => prev.map(n => ({ ...n, read: true })));
//       setUnreadCount(0);
//     } catch (err) {
//       console.error("Error marking all as read:", err);
//       toast.error("Failed to mark all notifications as read");
//     }
//   };

//   const clearError = () => {
//     setError(null);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-200">
//       <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//         className="max-w-3xl mx-auto"
//       >
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
//               Notifications
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 mt-1">
//               {unreadCount > 0 
//                 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
//                 : 'All caught up!'}
//             </p>
//           </div>
          
//           <div className="flex gap-2">
//             {unreadCount > 0 && (
//               <button
//                 onClick={markAllAsRead}
//                 disabled={refreshing}
//                 className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
//               >
//                 <FaCheck size={14} />
//                 Mark all read
//               </button>
//             )}
//             <button
//               onClick={() => fetchNotifications(true)}
//               disabled={refreshing}
//               className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-800 dark:text-white rounded-lg transition-colors"
//             >
//               <FaSync size={14} className={refreshing ? "animate-spin" : ""} />
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center"
//           >
//             <div className="flex items-center gap-3">
//               <FaExclamationCircle className="text-red-500 flex-shrink-0" />
//               <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
//             </div>
//             <button
//               onClick={clearError}
//               className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
//             >
//               <FaTimes size={16} />
//             </button>
//           </motion.div>
//         )}

//         {/* Content */}
//         {loading ? (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="flex flex-col items-center justify-center py-12 gap-4"
//           >
//             <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
//             <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
//           </motion.div>
//         ) : notifications.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-center flex flex-col items-center gap-4 py-12"
//           >
//             <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
//               <FaBellSlash className="text-3xl text-gray-400" />
//             </div>
//             <p className="text-gray-500 dark:text-gray-400 text-lg">No notifications yet</p>
//             <p className="text-gray-400 dark:text-gray-500 text-sm max-w-md">
//               You'll see notifications here when someone likes, comments on your videos, or when new content is available.
//             </p>
//           </motion.div>
//         ) : (
//           <div className="space-y-3">
//             <AnimatePresence>
//               {notifications.map((note) => (
//                 <NotificationCard
//                   key={note._id}
//                   notification={note}
//                   onMarkRead={markAsRead}
//                   onDelete={deleteNotification}
//                 />
//               ))}
//             </AnimatePresence>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default NotificationPage;

/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback } from "react";
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

const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const { type, message, videoId, createdAt, read } = notification;

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
        <div className={`flex-shrink-0 p-3 rounded-full ${getTypeColor().split(' ')[0]} bg-opacity-30`}>
          {getIcon()}
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
                  aria-label="Mark as read"
                  title="Mark as read"
                >
                  <FaCheck size={14} />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(notification._id); }}
                className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                aria-label="Delete notification"
                title="Delete notification"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>

          <Link to={videoId ? `/video/${videoId}` : "#"} className="block" onClick={(e) => !videoId && e.preventDefault()}>
            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
              {message}
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

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      setError(null);

      const res = await API.get("/notifications");
      if (res?.data?.success) {
        const fetched = res.data.data || [];
        setNotifications(fetched);
        setUnreadCount(fetched.filter(n => !n.read).length);
      } else throw new Error(res?.data?.message || "Failed to fetch notifications.");
    } catch (err) {
      console.error("Notification error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/mark-read`);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount(prev => prev - 1);
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deleted && !deleted.read) setUnreadCount(prev => prev - 1);
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed to mark all notifications as read");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors">
                <FaCheck size={14} /> Mark all read
              </button>
            )}
            <button onClick={() => fetchNotifications(true)} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-800 dark:text-white rounded-lg transition-colors">
              <FaSync size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaExclamationCircle className="text-red-500 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 dark:hover:text-red-300"><FaTimes size={16} /></button>
          </motion.div>
        )}

        {/* Notifications List */}
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
          </motion.div>
        ) : notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-500 dark:text-gray-400">
            No notifications yet.
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map(note => (
                <NotificationCard key={note._id} notification={note} onMarkRead={markAsRead} onDelete={deleteNotification} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationPage;
