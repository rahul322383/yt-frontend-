
/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  Settings,
  BarChart2,
  LogOut,
  Folder,
  Tv,
  Eye,
  Home,
  Menu,
  ChevronLeft,
  ListVideo,
  Clock,
  Video,
  Heart,
  Flame,
  ThumbsUp,
  History,
  PlaySquare,
  Film,
  TrendingUp,
  HelpCircle,
  Lock,
  Youtube
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "../../../index.css";
import { AuthContext } from "../../../context/AuthContext";
import API from "../../../utils/axiosInstance.jsx";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔑 Get auth + logout from context
  const { auth, logout } = useContext(AuthContext);
  
  // Fetch user data
  const fetchUserData = async () => {
    if (!auth?.isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await API.get("/users/me");
      if (response?.data?.success) {
        setUserData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [auth?.isAuthenticated]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  // ✅ Base nav items (public)
  const publicNav = [
    { to: "/", label: "Home", icon: Home },
    { to: "/trending", label: "Trending", icon: Flame },
    { to: "/subscriptions", label: "Subscriptions", icon: Tv },
  ];

  // ✅ Private nav items (only if logged in)
  const privateNav = [
    {
      title: "You",
      items: [
        { to: "/dashboard", label: "Your channel", icon: User },
        { to: "/playlists", label: "Playlists", icon: ListVideo },
        { to: "/history", label: "History", icon: History },
        { to: "/watch-later", label: "Watch later", icon: Clock },
        { to: "/liked-videos", label: "Liked videos", icon: ThumbsUp },
        { to: "/videos", label: "Your videos", icon: PlaySquare },
        { to: "/analytics", label: "Analytics", icon: Folder },
   { to: "/views", label: "Views", icon: Eye },
    { to: "/AnalyticsSection", label: "Analytics Reports", icon: BarChart2 }
      ]
    },
    {
      title: "Explore",
      items: [
        { to: "/shorts", label: "Shorts", icon: Film },
        { to: "/subscriptions", label: "Subscriptions", icon: Tv },
      ]
    },
    {
      title: "Settings",
      items: [
        { to: "/settings", label: "Settings", icon: Settings },
        { to: "/contact", label: "Send feedback", icon: Heart },
        { to: "/about", label: "About", icon: Youtube },
        { to: "/help", label: "Help", icon: HelpCircle },
        { to: "/privacy-policy", label: "Privacy Policy", icon: Lock },
        
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isCollapsed && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: isMobile ? -250 : 0 }}
        animate={{ 
          x: isMobile && !isCollapsed ? 0 : isMobile ? -250 : 0 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100 flex flex-col transition-all duration-300 fixed md:relative z-50 ${
          isCollapsed ? "w-16 md:w-16" : "w-60"
        }`}
      >
        {/* Top Logo Section */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {isCollapsed ? (
              <Youtube size={28} className="text-red-600" />
            ) : (
               <Link to="/" className="text-xl font-bold flex items-center gap-2">
                          <span className="text-blue-600">My</span>VideoApp
                        </Link>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* User Info Section */}
        {auth?.isAuthenticated && (
          <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-800">
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                {!isCollapsed && (
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                )}
              </div>
            ) : userData ? (
              <div className="flex items-center gap-3">
                <img
                  src={userData.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                {!isCollapsed && (
                  <div>
                    <p className="font-medium text-sm">
                      {userData.fullName || "Your Name"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{userData.username || "username"}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              !isCollapsed && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  User data not available
                </div>
              )
            )}
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Public nav */}
          <div className="mb-2">
            <ul className="space-y-1 px-2">
              {publicNav.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-4 px-3 py-3 transition-all rounded-lg text-sm font-medium group ${
                      isActive(to)
                        ? "bg-gray-100 dark:bg-gray-800 font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    data-tooltip-id={`tooltip-${label}`}
                    data-tooltip-content={label}
                  >
                    <Icon 
                      size={22} 
                      className="flex-shrink-0" 
                      strokeWidth={isActive(to) ? 2.5 : 2}
                    />
                    {!isCollapsed && (
                      <span className="truncate transition-opacity">{label}</span>
                    )}
                  </Link>
                  {isCollapsed && <Tooltip id={`tooltip-${label}`} place="right" />}
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

          {/* Private nav (only if logged in) */}
          {auth?.isAuthenticated && (
            <>
              {privateNav.map((group, index) => (
                <div key={index} className="mb-4">
                  {!isCollapsed && (
                    <p className="text-xs px-4 py-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                      {group.title}
                    </p>
                  )}
                  <ul className="space-y-1 px-2">
                    {group.items.map(({ to, label, icon: Icon }) => (
                      <li key={to}>
                        <Link
                          to={to}
                          className={`flex items-center gap-4 px-3 py-3 transition-all rounded-lg text-sm font-medium group ${
                            isActive(to)
                              ? "bg-gray-100 dark:bg-gray-800 font-semibold"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          data-tooltip-id={`tooltip-${label}`}
                          data-tooltip-content={label}
                        >
                          <Icon 
                            size={22} 
                            className="flex-shrink-0" 
                            strokeWidth={isActive(to) ? 2.5 : 2}
                          />
                          {!isCollapsed && (
                            <span className="truncate transition-opacity">{label}</span>
                          )}
                        </Link>
                        {isCollapsed && <Tooltip id={`tooltip-${label}`} place="right" />}
                      </li>
                    ))}
                  </ul>
                  
                  {/* Add divider after first section */}
                  {index === 0 && !isCollapsed && (
                    <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                  )}
                </div>
              ))}
            </>
          )}
        </nav>

        {/* User section at bottom when expanded */}
        {auth?.isAuthenticated && !isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-red-600 dark:text-red-400"
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        )}

        {/* Collapsed logout button */}
        {auth?.isAuthenticated && isCollapsed && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={logout}
              className="flex items-center justify-center p-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              data-tooltip-id="tooltip-logout"
              data-tooltip-content="Sign out"
            >
              <LogOut size={20} className="text-red-600 dark:text-red-400" />
            </button>
            <Tooltip id="tooltip-logout" place="right" />
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;