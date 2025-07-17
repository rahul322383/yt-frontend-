/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import API from "../../utils/axiosInstance.jsx";
import "../../index.css";

const filters = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

const AnalyticsSection = () => {
  const [filter, setFilter] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState({
    totalVideos: 0,
    totalViews: 0,
    viewsPerVideo: [],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users/analytics/playlist/videos`);
      const raw = res?.data?.data || {};

      if (raw && Array.isArray(raw.viewsPerVideo)) {
        setAnalyticsData(raw);
      } else {
        setAnalyticsData({
          totalVideos: 0,
          totalViews: 0,
          viewsPerVideo: [],
        });
      }
    } catch (err) {
      toast.error("Failed to load analytics data");
      setAnalyticsData({
        totalVideos: 0,
        totalViews: 0,
        viewsPerVideo: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filter]);

  const { totalVideos, totalViews, viewsPerVideo } = analyticsData;

  const isValidArray = Array.isArray(viewsPerVideo);
  const averageViews = isValidArray && viewsPerVideo.length
    ? (viewsPerVideo.reduce((acc, v) => acc + (v.views || 0), 0) / viewsPerVideo.length).toFixed(1)
    : 0;

  const barChartData = isValidArray
    ? viewsPerVideo.map((video) => ({
        title: video.title,
        views: video.views || 0,
      }))
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (!isValidArray || !viewsPerVideo.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <span className="text-gray-600 text-lg">No analytics data available</span>
        <Button onClick={() => navigate("/playlist")} className="gap-2">
          <PlusCircle className="w-5 h-5" />
          Create your first playlist
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6 bg-gray-50 rounded-xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Playlist Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Track your playlist performance</p>
        </div>
        <Button onClick={() => navigate("/playlist")} className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Create Playlist
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={f.value === filter ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
            className="transition duration-200"
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Playlists", value: 1 },
          { label: "Total Videos", value: totalVideos },
          { label: "Total Views", value: totalViews },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <h3 className="text-sm font-medium text-gray-500">{item.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Average Views</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {averageViews} <span className="text-sm font-normal">views/video</span>
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-800">Views per Video</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="title"
                angle={-30}
                textAnchor="end"
                interval={0}
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Video Previews</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {viewsPerVideo.slice(0, 4).map((video) => (
            <motion.div
              key={video.videoId}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200"
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/video/${video.videoId}`)}
            >
              <div className="relative aspect-video bg-black">
                {video.videoUrl ? (
                  <video
                    src={video.videoUrl}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>No preview available</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-medium text-gray-900 line-clamp-2">{video.title}</h4>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{video.views || 0} views</span>
                  <span>{video.likes || 0} likes</span>
                </div>
                <p className="text-xs text-gray-500">By: {video.videoOwner || "Unknown"}</p>
                <p className="text-xs text-gray-500">Channel: {video.channelName || "N/A"}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsSection;