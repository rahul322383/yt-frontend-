/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
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
  Flame
} from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "../../../index.css";

const Sidebar = ({ user, handleLogout }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navGroups = [
    {
      title: "Main",
      items: [
        { to: "/", label: "Home", icon: Home },
        { to: "/profile", label: "Profile", icon: User },
        { to: "/settings", label: "Settings", icon: Settings }
      ]
    },
    {
      title: "Library",
      items: [
        { to: "/playlists", label: "Playlists", icon: ListVideo },
        { to: "/history", label: "History", icon: Clock },
        { to: "/watch-later", label: "Watch Later", icon: Video },
        { to: "/liked-videos", label: "Liked Videos", icon: Heart },
        { to: "/shorts", label: "Shorts", icon: Flame },
        { to: "/uploads", label: "Uploads", icon: Folder }
      ]
    },
    {
      title: "Channel",
      items: [
        { to: "/AnalyticsSection", label: "AnalyticsSection", icon: Folder },
        { to: "/subscriptions", label: "Subscriptions", icon: Tv },
        { to: "/views", label: "Views", icon: Eye },
        { to: "/analytics", label: "Analytics", icon: BarChart2 }
      ]
    }
  ];

  return (
    <motion.aside
      initial={{ x: isMobile ? -300 : 0 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r dark:border-gray-700 shadow-sm flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top User Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-blue-500 dark:border-blue-400 object-cover"
            />
            <div>
              <p className="font-semibold text-sm line-clamp-1">
                {user?.fullName || "Channel Owner"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {user?.email || "your@email.com"}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {navGroups.map((group, index) => (
          <div key={index} className="mb-6">
            {!isCollapsed && (
              <p className="text-xs uppercase px-4 py-2 text-gray-500 dark:text-gray-400 font-medium">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-4 px-4 py-3 mx-2 transition-all rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium ${
                      isActive(to)
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    data-tooltip-id={`tooltip-${label}`}
                    data-tooltip-content={label}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{label}</span>
                    )}
                  </Link>
                  {isCollapsed && <Tooltip id={`tooltip-${label}`} />}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sticky Bottom Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 mx-2 w-full rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all text-sm font-medium"
          data-tooltip-id="tooltip-logout"
          data-tooltip-content="Logout"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </button>
        {isCollapsed && <Tooltip id="tooltip-logout" />}
      </div>
    </motion.aside>
  );
};

export default Sidebar;