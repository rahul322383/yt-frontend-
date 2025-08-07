/* eslint-disable no-unused-vars */

"use client";
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
  Cell,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Loader2, PlusCircle, BarChart2, Video, List, X, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import API from "../../utils/axiosInstance.jsx";
import "../../index.css";

const timeFilters = [
  { label: "7D", value: "7d", tooltip: "Last 7 Days" },
  { label: "30D", value: "30d", tooltip: "Last 30 Days" },
  { label: "All", value: "all", tooltip: "All Time" },
];

const AnalyticsSection = () => {
  const [activeFilter, setActiveFilter] = useState("7d");
  const [analytics, setAnalytics] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalComments: 0,
    viewsPerVideo: [],
    playlists: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/users/analytics/playlist/videos?range=${activeFilter}`);
      const data = response?.data?.data || {};
      
      setAnalytics({
        totalVideos: data.totalVideos || 0,
        totalViews: data.totalViews || 0,
        totalLikes: data.totalLikes || 0,
        totalDislikes: data.totalDislikes || 0,
        totalComments: data.totalComments || 0,
        viewsPerVideo: Array.isArray(data.viewsPerVideo) ? data.viewsPerVideo : [],
        playlists: Array.isArray(data.playlists) ? data.playlists : []
      });
    } catch (error) {
      toast.error("Failed to load analytics data");
      console.error("Analytics error:", error);
      setAnalytics({
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalDislikes: 0,
        totalComments: 0,
        viewsPerVideo: [],
        playlists: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [activeFilter]);

  const calculateAverageViews = () => {
    if (!analytics.viewsPerVideo.length) return 0;
    const total = analytics.viewsPerVideo.reduce((sum, video) => sum + (video.views || 0), 0);
    return (total / analytics.viewsPerVideo.length).toFixed(1);
  };

  const prepareChartData = () => {
    return analytics.viewsPerVideo
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(video => ({
        name: video.title?.length > 12 ? `${video.title.substring(0, 10)}...` : video.title,
        views: video.views || 0,
        likes: video.likes || 0,
        dislikes: video.dislikes || 0,
        comments: video.comments || 0,
        videoId: video.videoId,
        fullTitle: video.title,
        videoUrl: video.videoUrl,
        uploadedAt: video.uploadedAt
      }));
  };

  const handleVideoClick = (video) => {
    if (video.videoUrl) {
      setSelectedVideo(video);
    } else if (video.videoId) {
      navigate(`/video/${video.videoId}`);
    }
  };

  const handlePlaylistClick = (playlistId) => {
    if (playlistId) {
      navigate(`/playlists/${playlistId}`);
    }
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (!analytics.viewsPerVideo.length && !analytics.playlists.length) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[50vh] gap-6 p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-blue-100 p-4 rounded-full">
          <BarChart2 className="h-8 w-8 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">No analytics data yet</h3>
          <p className="text-gray-500 max-w-md">
            Start creating playlists and uploading videos to track your content performance
          </p>
        </div>
        <Button 
          onClick={() => navigate("/playlist/create")}
          className="gap-2"
          size="lg"
        >
          <PlusCircle className="w-5 h-5" />
          Create First Playlist
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Video Modal */}
      {selectedVideo && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button 
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="aspect-video w-full bg-black">
              <video
                src={selectedVideo.videoUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                title={selectedVideo.fullTitle || "Video"}
              />
            </div>
            
            <div className="p-4 bg-black text-white">
              <h3 className="text-xl font-bold mb-2">{selectedVideo.fullTitle}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <span>{selectedVideo.views?.toLocaleString() || 0} views</span>
                <span>{formatDate(selectedVideo.uploadedAt)}</span>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{selectedVideo.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="w-4 h-4" />
                  <span>{selectedVideo.dislikes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{selectedVideo.comments || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Header Section */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Content Analytics</h1>
          <p className="text-gray-500 mt-2">Track your video and playlist performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {timeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(filter.value)}
                className="relative"
                title={filter.tooltip}
              >
                {activeFilter === filter.value && (
                  <motion.span
                    layoutId="filterIndicator"
                    className="absolute inset-0 bg-blue-600 rounded-md"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{filter.label}</span>
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={() => navigate("/playlists/create")}
            className="gap-2"
            size="sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Playlist</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {[
          { 
            label: "Playlists", 
            value: analytics.playlists.length,
            icon: <List className="w-5 h-5 text-blue-600 cursor-pointer" />,
            color: "bg-blue-100 cursor-pointer",
            onClick: () => navigate("/playlists")
          },
          { 
            label: "Videos", 
            value: analytics.totalVideos,
            icon: <Video className="w-5 h-5 text-green-600 cursor-pointer" />,
            color: "bg-green-100 cursor-pointer",
            onClick: () => navigate("/videos")
          },
          { 
            label: "Total Views", 
            value: analytics.totalViews,
            icon: <BarChart2 className="w-5 h-5 text-purple-600 cursor-pointer" />,
            color: "bg-purple-100 cursor-pointer",
            onClick: () => navigate("/views")
          },
          { 
            label: "Engagement", 
            value: `${analytics.totalLikes} Likes`,
            icon: <ThumbsUp className="w-5 h-5 text-amber-600" />,
            color: "bg-amber-100",
            secondaryValue: `${analytics.totalComments} Comments`
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={stat.onClick}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                {stat.secondaryValue && (
                  <p className="text-sm text-gray-500 mt-1">{stat.secondaryValue}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Chart Section */}
      <motion.div
        className="bg-white p-5 rounded-xl border border-gray-200 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Videos</h2>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.viewsPerVideo.length} videos analyzed
            </p>
          </div>
          {analytics.viewsPerVideo.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/videos")}
            >
              View all videos →
            </Button>
          )}
        </div>
        
        {analytics.viewsPerVideo.length > 0 ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                layout="vertical"
                onClick={(e) => {
                  if (e.activePayload?.[0]?.payload) {
                    handleVideoClick(e.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                  formatter={(value, name, props) => {
                    if (name === 'views') return [`${value} views`, props.payload.fullTitle];
                    if (name === 'likes') return [`${value} likes`, props.payload.fullTitle];
                    if (name === 'dislikes') return [`${value} dislikes`, props.payload.fullTitle];
                    if (name === 'comments') return [`${value} comments`, props.payload.fullTitle];
                    return [value, name];
                  }}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'views') return 'Views';
                    if (value === 'likes') return 'Likes';
                    if (value === 'dislikes') return 'Dislikes';
                    if (value === 'comments') return 'Comments';
                    return value;
                  }}
                />
                <Bar 
                  dataKey="views"
                  name="Views"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  fill="#3b82f6"
                />
                <Bar 
                  dataKey="likes"
                  name="Likes"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  fill="#10b981"
                />
                <Bar 
                  dataKey="dislikes"
                  name="Dislikes"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  fill="#ef4444"
                />
                <Bar 
                  dataKey="comments"
                  name="Comments"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  fill="#8b5cf6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
            <BarChart2 className="w-10 h-10 opacity-50" />
            <p>No video data available for the selected period</p>
          </div>
        )}
      </motion.div>

      {/* Top Videos Grid */}
      {analytics.viewsPerVideo.length > 0 && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Video Highlights</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/videos")}
            >
              View all videos →
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {analytics.viewsPerVideo
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 4)
              .map((video, index) => (
              <motion.div
                key={video.videoId}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                whileHover={{ y: -4 }}
                onClick={() => handleVideoClick(video)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
              >
                <div className="relative aspect-video bg-gray-100">
                  {video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Video className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration || '0:00'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="flex gap-3 text-white text-sm">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {video.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {video.comments || 0}
                      </span>
                      <span>{video.views?.toLocaleString() || 0} views</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2">{video.title}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm text-gray-500">
                      {formatDate(video.uploadedAt)}
                    </div>
                    {video.playlistId && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaylistClick(video.playlistId);
                        }}
                      >
                        Playlist
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsSection;