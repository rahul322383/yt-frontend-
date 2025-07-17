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
    (sum, item) => sum + (item.like || 0),
    0
  );
  const totalComments = videoAnalytics.reduce(
    (sum, item) => sum + (item.comment || 0),
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
      </div>
    );
  }

  if (!playlistAnalytics.length && !videoAnalytics.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-red-500">Failed to load analytics data.</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Playlist Analytics</h2>
        <button
          onClick={() => navigate("/playlist")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Create Playlist
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ label: "Total Playlists", value: totalPlaylists },
        { label: "Total Videos", value: totalVideos },
        { label: "Total Playlist Views", value: totalViews },
        { label: "Total Video Views", value: totalVideoViews },
        { label: "Total Likes", value: totalLikes },
        { label: "Total Comments", value: totalComments }].map((item, idx) => (
          <div key={idx} className="p-4 bg-white shadow-md rounded-xl text-center">
            <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Playlist Views Chart */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Views per Playlist</h3>
        {playlistBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={playlistBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="playlistName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500 py-10">
            No playlist views data available.
          </div>
        )}
      </div>

      {/* Video Views Chart */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Views per Video</h3>
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
              <Bar dataKey="views" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500 py-10">
            No video views data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPlaylistsPage;
