/* eslint-disable no-unused-vars */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShare2,
  FiCopy,
  FiTwitter,
  FiFacebook,
  FiX,
  FiLink
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

export default function ShareButton({ video }) {
  const [open, setOpen] = useState(false);
  const shareRef = useRef(null);
  const buttonRef = useRef(null);

  // Close the popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (shareRef.current && !shareRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get the current URL for sharing
  const videoUrl = video?.videoUrl || typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      toast.success("✅ Link copied to clipboard!");
      setOpen(false);
    } catch (error) {
      toast.error("❌ Failed to copy link");
    }
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: <FiCopy className="w-5 h-5" />,
      action: handleCopy,
      color: "text-gray-700 dark:text-gray-300"
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="w-5 h-5 text-green-500" />,
      href: `https://wa.me/?text=${encodeURIComponent(videoUrl)}`,
      color: "hover:bg-green-50 dark:hover:bg-green-900/20"
    },
    {
      name: "Twitter",
      icon: <FiTwitter className="w-5 h-5 text-blue-400" />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=Check%20out%20this%20video!`,
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
    },
    {
      name: "Facebook",
      icon: <FiFacebook className="w-5 h-5 text-blue-600" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
    },
    {
      name: "Telegram",
      icon: <FaTelegram className="w-5 h-5 text-blue-500" />,
      href: `https://t.me/share/url?url=${encodeURIComponent(videoUrl)}&text=Check%20out%20this%20video!`,
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
    }
  ];

  return (
    <div className="relative inline-block">
      {/* Toast container */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700',
          duration: 3000,
        }}
      />

      {/* Share button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-full shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
        aria-label="Share video"
        aria-expanded={open}
      >
        <FiShare2 className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">Share</span>
      </button>

      {/* Popup menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Background overlay */}
            <motion.div
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Popup box */}
            <motion.div
              ref={shareRef}
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 bg-white dark:bg-gray-800 shadow-xl rounded-t-2xl sm:rounded-2xl p-5 w-full sm:w-80 z-50 border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Video</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close share menu"
                >
                  <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* URL preview */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <FiLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{videoUrl}</p>
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {shareOptions.map((option, index) => (
                  option.action ? (
                    <button
                      key={index}
                      onClick={option.action}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl p-3 transition-colors duration-200 ${option.color} hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-200 dark:border-gray-700`}
                    >
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {option.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{option.name}</span>
                    </button>
                  ) : (
                    <a
                      key={index}
                      href={option.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl p-3 transition-colors duration-200 ${option.color} border border-gray-200 dark:border-gray-700`}
                      onClick={() => setOpen(false)}
                    >
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {option.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{option.name}</span>
                    </a>
                  )
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}