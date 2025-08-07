/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, PlusCircle, ArrowRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import API from "../../utils/axiosInstance.jsx";
import "../../index.css";

const AnalyticsPlaylistsPage = () => {
  const [playlistAnalytics, setPlaylistAnalytics] = useState([]);
  const [videoAnalytics, setVideoAnalytics] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    viewsPerVideo: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [playlistRes, videoRes] = await Promise.all([
          API.get(`/users/analytics/playlist`, { withCredentials: true }),
          API.get(`/users/analytics/playlist/videos`, { withCredentials: true })
        ]);
        
        setPlaylistAnalytics(playlistRes.data?.data || []);
        setVideoAnalytics({
          totalVideos: videoRes.data?.data?.totalVideos || 0,
          totalViews: videoRes.data?.data?.totalViews || 0,
          totalLikes: videoRes.data?.data?.totalLikes || 0,
          totalComments: videoRes.data?.data?.totalComments || 0,
          viewsPerVideo: videoRes.data?.data?.viewsPerVideo || []
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setPlaylistAnalytics([]);
        setVideoAnalytics({
          totalVideos: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          viewsPerVideo: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  // Calculate metrics based on API response structure
  const metrics = {
    playlists: playlistAnalytics.length,
    videos: videoAnalytics.totalVideos,
    playlistViews: playlistAnalytics.reduce((sum, item) => sum + (item.totalViews || 0), 0),
    videoViews: videoAnalytics.totalViews,
    likes: videoAnalytics.totalLikes,
    comments: videoAnalytics.totalComments,
  };

  // Prepare chart data with navigation handlers
  const playlistBarData = playlistAnalytics.map((playlist) => ({
    name: playlist.playlistTitle || `Playlist ${playlist.playlistId.slice(-4)}`,
    views: playlist.totalViews || 0,
    id: playlist.playlistId,
    onClick: () => navigate(`/playlists/${playlist.playlistId}`)
  }));

  const videoBarData = videoAnalytics.viewsPerVideo.map((video) => ({
    name: video.title || `Video ${video.videoId.slice(-4)}`,
    views: video.views || 0,
    id: video.videoId,
    likes: video.likes || 0,
    comments: video.comments || 0,
    onClick: () => navigate(`/video/${video.videoId}`),
  }));

  // Color palette
  const COLORS = {
    playlist: '#6366F1',
    video: '#10B981',
    accent: '#3B82F6',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280'
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label, type }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {type === 'playlist' ? 'Playlist:' : 'Video:'} <span className="text-blue-600 dark:text-blue-400">{data.name}</span>
          </p>
          <p className="text-sm">
            Views: <span className="font-semibold">{data.views.toLocaleString()}</span>
          </p>
          {type === 'video' && (
            <>
              <p className="text-sm">
                Likes: <span className="font-semibold">{data.likes || 0}</span>
              </p>
              <p className="text-sm">
                Comments: <span className="font-semibold">{data.comments || 0}</span>
              </p>
            </>
          )}
          <button 
            onClick={() => navigate(type === 'playlist' ? `/playlists/${data.id}` : `/video/${data.id}`)}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            View details <ArrowRight className="ml-1 w-3 h-3" />
          </button>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!playlistAnalytics.length && !videoAnalytics.viewsPerVideo.length) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-6 text-center px-4">
        <div className="bg-blue-100 p-4 rounded-full">
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No analytics data yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Start creating playlists and adding videos to see detailed analytics about your content performance.
          </p>
        </div>
        <button
          onClick={() => navigate("/playlist")}
          className="px-6 py-3 flex items-center gap-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <PlusCircle size={18} /> Create Your First Playlist
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Playlist Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track performance and engagement metrics for your playlists
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate("/playlist")}
            className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <PlusCircle className="w-5 h-5" /> New Playlist
          </button>
          <button
            onClick={() => navigate("/videos")}
            className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            View Videos <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Playlists", value: metrics.playlists, icon: '📚', onClick: () => navigate("/playlist") },
          { label: "Videos", value: metrics.videos, icon: '🎬', onClick: () => navigate("/videos") },
          { label: "Playlist Views", value: metrics.playlistViews.toLocaleString(), icon: '👀', onClick: () => navigate("/views") },
          { label: "Video Views", value: metrics.videoViews.toLocaleString(), icon: '📺' },
          { label: "Likes", value: metrics.likes.toLocaleString(), icon: '👍' },
          { label: "Comments", value: metrics.comments.toLocaleString(), icon: '💬' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow ${stat.onClick ? 'cursor-pointer' : ''}`}
            onClick={stat.onClick || undefined}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playlist Views Chart */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Views per Playlist</h3>
            {playlistBarData.length > 5 && (
              <button 
                onClick={() => navigate("/playlist")}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </button>
            )}
          </div>
          {playlistBarData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={playlistBarData.slice(0, 5)}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: COLORS.text.secondary }}
                    tickFormatter={(name) => name.length > 12 ? `${name.slice(0, 10)}…` : name}
                  />
                  <YAxis tick={{ fill: COLORS.text.secondary }} />
                  <Tooltip 
                    content={<CustomTooltip type="playlist" />}
                  />
                  <Bar 
                    dataKey="views" 
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => navigate(`/playlists/${data.id}`)}
                  >
                    {playlistBarData.slice(0, 5).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS.playlist} 
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No playlist views data available</p>
              <button
                onClick={() => navigate("/playlist")}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                Create a playlist <ArrowRight className="ml-1 w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Video Views Chart */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Views per Video</h3>
            {videoBarData.length > 5 && (
              <button 
                onClick={() => navigate("/videos")}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </button>
            )}
          </div>
          {videoBarData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={videoBarData.slice(0, 5)}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: COLORS.text.secondary }}
                    tickFormatter={(name) => name.length > 12 ? `${name.slice(0, 10)}…` : name}
                  />
                  <YAxis tick={{ fill: COLORS.text.secondary }} />
                  <Tooltip 
                    content={<CustomTooltip type="video" />}
                  />
                  <Bar 
                    dataKey="views" 
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => navigate(`/video/${data.id}`)}
                  >
                    {videoBarData.slice(0, 5).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS.video} 
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No video views data available</p>
              <button
                onClick={() => navigate("/videos")}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                Browse videos <ArrowRight className="ml-1 w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPlaylistsPage;