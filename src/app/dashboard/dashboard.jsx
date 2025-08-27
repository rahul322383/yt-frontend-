/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Bell, LogOut, User, Settings, Plus, Menu, X } from "lucide-react";
import Sidebar from "../components/sidebar/sidebar.jsx";
import DashboardVideoCard from "../components/VideoCard/dashvideo.jsx";
import LikedVideosPage from "../components/VideoCard/LikedVideosPage.jsx";
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
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  // Initialize dark mode based on system preference
  useEffect(() => {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(isDarkMode);
    }
  }, []);

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
          dashboardVideos: dashVidRes.data.data || {},
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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
   
     

      {/* Mobile sidebar overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 h-full w-64 z-50 transform transition-transform">
            <Sidebar
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              user={dashboardData.user}
              isMenuOpen={isMenuOpen}
              toggleMenu={() => setMenuOpen(!isMenuOpen)}
              handleLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center">
            <button
              className="md:hidden p-2 mr-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Creator Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
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
                className="flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <img
                  src={dashboardData.user?.avatar || "/default-avatar.png"}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium hidden sm:inline">
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
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowProfileDropdown(false)}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          <DashboardCard
            icon="👥"
            title="Subscribers"
            value={dashboardData.subscribers.toLocaleString()}
            link={`/subscribers/channel/${dashboardData.user?.channelId}`}
            color="bg-blue-100 dark:bg-blue-900"
          />
          <DashboardCard
            icon="🎥"
            title="Videos"
            value={dashboardData.videos?.total?.toLocaleString() || "0"}
            link="/videos"
            color="bg-green-100 dark:bg-green-900"
          />
          <DashboardCard
            icon="📊"
            title="Total Views"
            value={(dashboardData.status.totalViews || 0).toLocaleString()}
            link="/analytics"
            color="bg-purple-100 dark:bg-purple-900"
          />
          <DashboardCard
            icon="🔔"
            title="Subscriptions"
            value={dashboardData.subscribedChannels.length.toLocaleString()}
            link="/subscriptions"
            color="bg-yellow-100 dark:bg-yellow-900"
          />
        </div>

        <section className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold">Top Performing Videos</h2>
            <Link
              to="/videos"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              View All Videos
            </Link>
          </div>
          
          {dashboardData.dashboardVideos?.videos?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {dashboardData.dashboardVideos.videos.map((video) => (
                <div key={video.videoId} className="w-full">
                  <DashboardVideoCard video={video} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't uploaded any videos yet
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                <Plus size={18} className="mr-2" />
                Upload Your First Video
              </Link>
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold">Recent Playlists</h2>
            <Link
              to="/playlists/create"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              <Plus size={18} />
              New Playlist
            </Link>
          </div>
          
          {dashboardData.recentPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.recentPlaylists.slice(0, 3).map((playlist) => (
                <PlaylistCard key={playlist._id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't created any playlists yet
              </p>
              <Link
                to="/playlists/create"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
              >
                <Plus size={18} className="mr-2" />
                Create Your First Playlist
              </Link>
            </div>
          )}
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Liked Videos</h2>
          <LikedVideosPage user={dashboardData.user} />
        </section>
      </main>
    </div>
  );
};

const DashboardCard = ({ icon, title, value, link, color }) => {
  return (
    <Link
      to={link}
      className={`${color} p-4 md:p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{title}</p>
          <p className="text-xl md:text-2xl font-bold">{value}</p>
        </div>
        <span className="text-2xl md:text-3xl">{icon}</span>
      </div>
      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
        View details →
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
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={() => navigate(`/playlists/${playlist._id}`)}
    >
      {playlist.videos?.length > 0 && (
        <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
          <img
            src={getThumbnail()}
            alt="Playlist thumbnail"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/default-thumbnail.jpg";
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
      
      <div className="p-4 flex-grow">
        <div className="flex items-center mb-2">
          <span className="text-xl mr-2">{playlist.icon || "📁"}</span>
          <h3 className="text-lg font-semibold truncate">{playlist.name}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {playlist.description || "No description"}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;