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
        const playlistRes = await API.get(`/users/analytics/playlist`, {
          withCredentials: true,
        });
        setPlaylistAnalytics(playlistRes.data?.data || []);

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

  const totalPlaylists = playlistAnalytics.length;
  const totalVideos = videoAnalytics.length;
  const totalViews = playlistAnalytics.reduce(
    (sum, item) => sum + (item.totalViews || 0),
    0
  );

  const totalVideoViews = videoAnalytics.reduce(
    (sum, item) => sum + (item.views || 0),
    0
  );
  const totalLikes = videoAnalytics.reduce(
    (sum, item) => sum + (item.likes || 0),
    0
  );
  const totalComments = videoAnalytics.reduce(
    (sum, item) => sum + (item.comments || 0),
    0
  );

  const playlistBarData = playlistAnalytics.map((p, idx) => ({
    playlistName: `Playlist ${idx + 1}`,
    views: p.totalViews,
  }));

  const videoBarData = videoAnalytics.map((video) => ({
    videoTitle: video.title,
    views: video.views,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (!playlistAnalytics.length && !videoAnalytics.length) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <p className="text-gray-500 text-lg">No analytics data available</p>
        <button
          onClick={() => navigate("/playlist")}
          className="px-4 py-2 flex items-center gap-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} /> Create Playlist
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Playlist Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Performance overview of your content</p>
        </div>
        <button
          onClick={() => navigate("/playlist")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-5 h-5" /> Create Playlist
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Playlists", value: totalPlaylists },
          { label: "Videos", value: totalVideos },
          { label: "Playlist Views", value: totalViews },
          { label: "Video Views", value: totalVideoViews },
          { label: "Likes", value: totalLikes },
          { label: "Comments", value: totalComments },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border p-4 text-center shadow-sm hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Playlist Views Chart */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Views per Playlist</h3>
        {playlistBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={playlistBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="playlistName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-6">No playlist views data</p>
        )}
      </div>

      {/* Video Views Chart */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Views per Video</h3>
        {videoBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={videoBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="videoTitle"
                tickFormatter={(name) =>
                  name.length > 12 ? `${name.slice(0, 12)}…` : name
                }
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-6">No video views data</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPlaylistsPage;
