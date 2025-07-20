"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, PlusCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import API from "../../utils/axiosInstance.jsx";
import "../../index.css";

const AnalyticsPlaylistsPage = () => {
  const [playlistAnalytics, setPlaylistAnalytics] = useState([]);
  const [videoAnalytics, setVideoAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch Playlist Analytics
        const playlistRes = await API.get(`/users/analytics/playlist`, {
          withCredentials: true,
        });
        setPlaylistAnalytics(playlistRes.data?.data || []);

        // Fetch Video Analytics
        const videoRes = await API.get(`/users/analytics/playlist/videos`, {
          withCredentials: true,
        });
        setVideoAnalytics(videoRes.data?.data?.viewsPerVideo || []);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setPlaylistAnalytics([]);
        setVideoAnalytics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Calculate statistics
  const stats = [
    { label: "Total Playlists", value: playlistAnalytics.length },
    { label: "Total Videos", value: videoAnalytics.length },
    { 
      label: "Total Playlist Views", 
      value: playlistAnalytics.reduce((sum, item) => sum + (item.totalViews || 0), 0) 
    },
    { 
      label: "Total Video Views", 
      value: videoAnalytics.reduce((sum, item) => sum + (item.views || 0), 0) 
    },
    { 
      label: "Total Likes", 
      value: videoAnalytics.reduce((sum, item) => sum + (item.like || 0), 0) 
    },
    { 
      label: "Total Comments", 
      value: videoAnalytics.reduce((sum, item) => sum + (item.comment || 0), 0) 
    }
  ];

  // Prepare chart data
  const playlistBarData = playlistAnalytics.map((p, idx) => ({
    name: p.name || `Playlist ${idx + 1}`,
    views: p.totalViews,
  }));

  const videoBarData = videoAnalytics.map((video) => ({
    name: video.title,
    views: video.views,
  }));

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  // Error/empty state
  if (!playlistAnalytics.length && !videoAnalytics.length) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <span className="text-red-500 text-lg">No analytics data available</span>
        <button
          onClick={() => navigate("/playlist")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Create your first playlist
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Playlist Analytics</h1>
          <p className="text-gray-600">Track your playlist and video performance</p>
        </div>
        <button
          onClick={() => navigate("/playlist")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Playlist Views Chart */}
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Views per Playlist</h3>
            {playlistAnalytics.length > 0 && (
              <span className="text-sm text-gray-500">
                {playlistAnalytics.length} playlists
              </span>
            )}
          </div>
          
          {playlistBarData.length > 0 ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playlistBarData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(name) => 
                      name.length > 12 ? `${name.substring(0, 10)}...` : name
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="views" 
                    fill="#4F46E5" 
                    radius={[4, 4, 0, 0]} 
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No playlist views data available</p>
            </div>
          )}
        </div>

        {/* Video Views Chart */}
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Views per Video</h3>
            {videoAnalytics.length > 0 && (
              <span className="text-sm text-gray-500">
                {videoAnalytics.length} videos
              </span>
            )}
          </div>
          
          {videoBarData.length > 0 ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={videoBarData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(name) => 
                      name.length > 12 ? `${name.substring(0, 10)}...` : name
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="views" 
                    fill="#4F46E5" 
                    radius={[4, 4, 0, 0]} 
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No video views data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPlaylistsPage;