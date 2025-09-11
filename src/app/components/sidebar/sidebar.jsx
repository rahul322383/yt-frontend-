/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useContext, useCallback } from "react";
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
  ChevronRight,
  ListVideo,
  Clock,
  Heart,
  Flame,
  ThumbsUp,
  History,
  PlaySquare,
  HelpCircle,
  Lock,
  Youtube,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "../../../index.css";
import { AuthContext } from "../../../context/AuthContext";
import API from "../../../utils/axiosInstance.jsx";

// --- NAV CONFIGS (moved outside so they're stable) ---
const publicNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/trending", label: "Trending", icon: Flame },
  { to: "/subscriptions", label: "Subscriptions", icon: Tv },
];

const exploreNav = [
  { to: "/trending", label: "Trending", icon: Flame },
  { to: "/about", label: "About", icon: Youtube },
  { to: "/help", label: "Help", icon: HelpCircle },
];

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
      { to: "/AnalyticsSection", label: "Analytics Reports", icon: BarChart2 },
    ],
  },
  {
    title: "Settings",
    items: [
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/contact", label: "Send feedback", icon: Heart },
      { to: "/about", label: "About", icon: Youtube },
      { to: "/help", label: "Help", icon: HelpCircle },
      { to: "/privacy-policy", label: "Privacy Policy", icon: Lock },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { auth, logout } = useContext(AuthContext);

  // fetch user data
  const fetchUserData = useCallback(async () => {
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
  }, [auth?.isAuthenticated]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile((prev) => {
        if (prev !== mobile) return mobile;
        return prev;
      });
      if (mobile) setIsCollapsed(true); // collapse on mobile
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* mobile overlay */}
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

      {/* sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile && isCollapsed ? -250 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100 flex flex-col fixed md:relative z-50 ${
          isCollapsed ? "w-16" : "w-60"
        }`}
      >
        {/* top logo + toggle */}
        <div
          className={`flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Link to="/" className="flex items-center gap-2">
            <Youtube size={28} className="text-red-600" />
            {!isCollapsed && (
              <span className="text-black dark:text-white font-bold">
                MyVideoApp
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* user info */}
        {auth?.isAuthenticated && !isCollapsed && (
          <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-800">
            {loading ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div>
                  <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-2 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ) : userData ? (
              <div className="flex items-center gap-3">
                <img
                  src={
                    userData.avatar ||
                    `https://ui-avatars.com/api/?name=${userData.fullName}`
                  }
                  alt="avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${userData.fullName}`;
                  }}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">
                    {userData.fullName || "Your Name"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    @{userData.username || "username"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                User data not available
              </div>
            )}
          </div>
        )}

        {/* nav */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* public nav */}
          <ul className="space-y-1 px-2">
            {publicNav.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={isActive(to) ? "page" : undefined}
                  aria-label={isCollapsed ? label : undefined}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "gap-4"
                  } px-3 py-3 transition-all rounded-lg text-sm font-medium group ${
                    isActive(to)
                      ? "bg-gray-100 dark:bg-gray-800 font-semibold"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  data-tooltip-id={`tooltip-${label}`}
                  data-tooltip-content={label}
                  onClick={() => isMobile && setIsCollapsed(true)}
                >
                  <Icon
                    size={22}
                    className="flex-shrink-0"
                    strokeWidth={isActive(to) ? 2.5 : 2}
                  />
                  {!isCollapsed && <span className="truncate">{label}</span>}
                </Link>
                {isCollapsed && (
                  <Tooltip id={`tooltip-${label}`} place="right" />
                )}
              </li>
            ))}
          </ul>

          {/* explore for guests */}
          {!auth?.isAuthenticated && !isCollapsed && (
            <div className="mt-4">
              <p className="text-xs px-4 py-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                Explore
              </p>
              <ul className="space-y-1 px-2">
                {exploreNav.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      aria-label={label}
                      className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                      onClick={() => isMobile && setIsCollapsed(true)}
                    >
                      <Icon size={22} />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* private nav */}
          {auth?.isAuthenticated && !isCollapsed && (
            <>
              {privateNav.map((group, index) => (
                <div key={group.title} className="mt-4">
                  <p className="text-xs px-4 py-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                    {group.title}
                  </p>
                  <ul className="space-y-1 px-2">
                    {group.items.map(({ to, label, icon: Icon }) => (
                      <li key={to}>
                        <Link
                          to={to}
                          aria-label={label}
                          className={`flex items-center gap-4 px-3 py-3 transition-all rounded-lg text-sm ${
                            isActive(to)
                              ? "bg-gray-100 dark:bg-gray-800 font-semibold"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          onClick={() => isMobile && setIsCollapsed(true)}
                        >
                          <Icon size={22} />
                          <span>{label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {index === 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                  )}
                </div>
              ))}
            </>
          )}
        </nav>

        {/* bottom logout */}
        {auth?.isAuthenticated && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={logout}
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-3 px-3"
              } py-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-red-600 dark:text-red-400`}
              data-tooltip-id="tooltip-logout"
              data-tooltip-content="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={20} />
              {!isCollapsed && <span>Sign out</span>}
            </button>
            {isCollapsed && <Tooltip id="tooltip-logout" place="right" />}
          </div>
        )}
      </motion.aside>

      {/* mobile hamburger */}
      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-1 z-40 p-2 rounded-full bg-white dark:bg-[#0f0f0f] shadow-md md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
