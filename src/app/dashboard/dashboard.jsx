/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, Bell, LogOut, User, Settings, Plus, History, ThumbsUp } from "lucide-react";
import Sidebar from "../components/sidebar/sidebar.jsx";
import VideoCard from "../components/VideoCard/VideoCard.jsx";
import LikedVideosPage from "../components/VideoCard/LikedVideosPage.jsx"
import API from "../../utils/axiosInstance.jsx";
import "../../index.css";
import LoadingSpinner from "../components/common/loadingSpinner.jsx";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    user: null,
    likedVideos: [],
    videos: [],
    dashboardVideos: [],
    recentPlaylists: [],
    playlistVideos: [],
    subscribers: 0,
    subscribedChannels: [],
    status: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const { data: userResponse } = await API.get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse?.data) throw new Error("Invalid user data");
        const userInfo = userResponse.data;

        const [
          playlistsRes,
          videoRes,
          likedRes,
          subRes,
          statusRes,
          dashVidRes,
          subscribedRes,
        ] = await Promise.all([
          API.get(`/users/playlist`),
          API.get(`/users/videos`),
          API.get(`/user/videos/liked-videos`),
          API.get(`/users/subscribe/channel/${userInfo.channelId}`),
          API.get(`/users/dashboard/${userInfo.username}/${userInfo.channelId}/status`),
          API.get(`/users/dashboard/${userInfo.username}/${userInfo.channelId}/videos`),
          API.get(`/users/subscribe/subscribed/${userInfo.channelId}`),
        ]);

        setDashboardData({
          user: userInfo,
          recentPlaylists: playlistsRes.data.data || [],
          videos: videoRes.data.data || [],
          likedVideos: likedRes.data.likedVideos || [],
          subscribers: subRes.data.data?.total || 0,
          status: statusRes.data.data || [],
          dashboardVideos: Array.isArray(dashVidRes.data.data) ? dashVidRes.data.data : [],
          subscribedChannels: subscribedRes.data.data?.channels || [],
          playlistVideos: Array.isArray(playlistsRes.data?.data)
            ? playlistsRes.data.data.flatMap((p) => p.videos || [])
            : [],
        });
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("Failed to load dashboard data.");
        if (err.response?.status === 401 || err.message === "No authentication token found") {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await API.post("/users/logout", {}, { withCredentials: true });
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/";
    } catch (err) {
      console.error("Logout Error:", err);
      toast.error("Logout failed!");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const totalViews = dashboardData.playlistVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const avgViews = dashboardData.playlistVideos.length
    ? Math.round(totalViews / dashboardData.playlistVideos.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center p-6 bg-red-100 dark:bg-red-900 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={dashboardData.user}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setMenuOpen(!isMenuOpen)}
        handleLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <header className="flex justify-between items-center mb-8">
          {/* <button
            className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => setMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button> */}
          
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Creator Dashboard
          </h1>

          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={() => navigate("/notifications")}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-blue-500" />
              {dashboardData.status?.notifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {dashboardData.status.notifications}
                </span>
              )}
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-800 dark:text-gray-300" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <img
                  src={dashboardData.user?.avatar || "/default-avatar.png"}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium hidden md:inline">
                  {dashboardData.user?.username || "User"}
                </span>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold">{dashboardData.user?.fullname}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {dashboardData.user?.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard
            icon="👥"
            title="Subscribers"
            value={dashboardData.subscribers}
            link={`/subscribers/channel/${dashboardData.user?.channelId}`}
            color="bg-blue-100 dark:bg-blue-900"
          />
<DashboardCard
  icon="🎥"
  title="Videos"
  value={dashboardData.videos?.total || 0}  // Use total count from API
  link="/videos"
  color="bg-green-100 dark:bg-green-900"
/>

          {/* <DashboardCard
            icon="📊"
            title="Avg. Views"
            value={avgViews || 0}
            link="/analytics"
            color="bg-purple-100 dark:bg-purple-900"
          /> */}
          <DashboardCard
            icon="🔔"
            title="Subscriptions"
            value={dashboardData.subscribedChannels.length}
            link="/subscriptions"
            color="bg-yellow-100 dark:bg-yellow-900"
          />
        </div>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Top Performing Videos</h2>
            <Link
              to="/videos"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Upload New
            </Link>
          </div>
          
          {dashboardData.dashboardVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.dashboardVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't uploaded any videos yet
              </p>
              <Link
                to="/videos"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} className="mr-2" />
                Upload Your First Video
              </Link>
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Playlists</h2>
            <Link
              to="/playlists/create"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={18} />
              New Playlist
            </Link>
          </div>
          
          {dashboardData.recentPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {dashboardData.recentPlaylists.map((playlist) => (
                <PlaylistCard key={playlist._id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't created any playlists yet
              </p>
              <Link
                to="/playlists/create"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} className="mr-2" />
                Create Your First Playlist
              </Link>

              
            </div>
          )}
        </section>
        <LikedVideosPage user={dashboardData.user} />
      </main>
    </div>
  );
};

const DashboardCard = ({ icon, title, value, link, color }) => {
  return (
    <Link
      to={link}
      className={`${color} p-6 rounded-lg shadow hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </Link>
  );
};

const PlaylistCard = ({ playlist }) => {
  const navigate = useNavigate();

  // Fallback to first video's thumbnail or default image
  const getThumbnail = () => {
    const firstVideo = playlist.videos?.[0];
    if (!firstVideo) return "/default-thumbnail.jpg";

    // If video has a thumbnail field, use it
    if (firstVideo.thumbnail) return firstVideo.thumbnail;

    // If using Cloudinary, try to generate thumbnail from videoUrl
    if (firstVideo.videoUrl?.includes("res.cloudinary.com")) {
      return firstVideo.videoUrl.replace("/upload/", "/upload/so_1/").replace(".mp4", ".jpg");
    }

    // Default
    return "/default-thumbnail.jpg";
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/playlists/${playlist._id}`)}
    >
      <div className="p-4">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3">{playlist.icon || "📁"}</span>
          <h3 className="text-lg font-semibold truncate">{playlist.name}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {playlist.description || "No description"}
        </p>
      </div>

      {playlist.videos?.length > 0 && (
        <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
          <img
            src={getThumbnail()}
            alt="Playlist thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {playlist.videos.length} videos
          </div>
        </div>
      )}
    </div>
  );
};


export default Dashboard;