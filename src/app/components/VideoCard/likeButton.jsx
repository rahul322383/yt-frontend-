/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axiosInstance.jsx";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LikeButton = ({
  videoId,
  initialLikeState = false,
  initialLikeCount = 0,
  initialDislikeCount = 0,
  isAuthenticated = false,
}) => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    upvoted: initialLikeState,
    downvoted: false,
    likes: initialLikeCount,
    dislikes: initialDislikeCount,
  });

  const [loading, setLoading] = useState(false);
  const [anim, setAnim] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null); // 'like' or 'dislike'

  // Get token and user ID
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  let currentUserId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUserId = decoded?._id || decoded?.userId || decoded?.id || null;
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get(`/user/videos/${videoId}/like-count`);
      
      const { likes = 0, dislikes = 0, upvoted = false, downvoted = false } = data.data || {};
      setState({ likes, dislikes, upvoted, downvoted: downvoted });
   
    } catch (err) {
      console.error("Fetch like stats error", err);
    }
  }, [videoId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleGuestInteraction = () => {
    setShowLoginPrompt(true);
    toast.info("Please login to interact", {
      position: "top-center",
      autoClose: 2000,
    });
  };
  
  const toggle = async (actionType) => {
    if (!token || !currentUserId) {
      handleGuestInteraction();
      return;
    }

    const isLike = actionType === "like";
    const alreadyActive = isLike ? state.upvoted : state.downvoted;

    // Optimistic UI update
    setState((prev) => {
      const newState = { ...prev };
      if (isLike) {
        newState.upvoted = !alreadyActive;
        newState.likes += alreadyActive ? -1 : 1;
        if (prev.downvoted) {
          newState.downvoted = false;
          newState.dislikes = Math.max(prev.dislikes - 1, 0);
        }
      } else {
        newState.downvoted = !alreadyActive;
        newState.dislikes += alreadyActive ? -1 : 1;
        if (prev.upvoted) {
          newState.upvoted = false;
          newState.likes = Math.max(prev.likes - 1, 0);
        }
      }
      return newState;
    });

    setLoading(true);
    setAnim(isLike ? "up" : "down");

    try {
      await API.post(
        `/user/videos/${videoId}/toggle-like`,
        { action: actionType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert on error
      fetchStats();
    } finally {
      setLoading(false);
      setTimeout(() => setAnim(null), 300);
    }
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Like Button */}
      <div className="relative">
        <motion.button
          onClick={() => toggle("like")}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => !token && setHoveredButton('like')}
          onHoverEnd={() => setHoveredButton(null)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 ${
            state.upvoted 
              ? "bg-red-500/10 text-red-500" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          } ${!token ? "cursor-not-allowed" : ""}`}
        >
          <motion.div
            animate={anim === "up" ? { scale: [1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ThumbsUp size={18} className={state.upvoted ? "fill-current" : ""} />
          </motion.div>
          <span className="text-sm font-medium">{state.likes}</span>
        </motion.button>
        
        {/* Hover Tooltip for Like */}
        {!token && hoveredButton === 'like' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10"
          >
            Login to like
          </motion.div>
        )}
      </div>

      {/* Dislike Button */}
      <div className="relative">
        <motion.button
          onClick={() => toggle("dislike")}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => !token && setHoveredButton('dislike')}
          onHoverEnd={() => setHoveredButton(null)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 ${
            state.downvoted 
              ? "bg-blue-500/10 text-blue-500" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          } ${!token ? "cursor-not-allowed" : ""}`}
        >
          <motion.div
            animate={anim === "down" ? { scale: [1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ThumbsDown size={18} className={state.downvoted ? "fill-current" : ""} />
          </motion.div>
          <span className="text-sm font-medium">{state.dislikes}</span>
        </motion.button>
        
        {/* Hover Tooltip for Dislike */}
        {!token && hoveredButton === 'dislike' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10"
          >
            Login to dislike
          </motion.div>
        )}
      </div>

      {/* Login Prompt */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 z-50 bg-white text-black shadow-lg p-4 rounded-xl w-64 border border-gray-200"
          >
            <div className="flex flex-col gap-3">
              <p className="font-medium text-center">Sign in to interact with videos</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex-1 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-500 text-sm hover:text-gray-800 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default LikeButton;