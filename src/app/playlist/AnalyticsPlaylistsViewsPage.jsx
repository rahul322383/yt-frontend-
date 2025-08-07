"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, PlusCircle, BarChart2, Film, Eye, Heart, MessageSquare, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend
} from "recharts";
import API from "../../utils/axiosInstance.jsx";
import "../../index.css";

const AnalyticsPlaylistsPage = () => {
  const [analyticsData, setAnalyticsData] = useState({
    playlists: [],
    videos: [],
    totals: {
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("playlists");
  const [timeRange, setTimeRange] = useState("all");
  const navigate = useNavigate();

  // Icons for stats cards
  const statIcons = {
    "Total Playlists": <Film className="w-5 h-5 text-indigo-500" />,
    "Total Videos": <BarChart2 className="w-5 h-5 text-blue-500" />,
    "Total Views": <Eye className="w-5 h-5 text-green-500" />,
    "Avg. Views": <Eye className="w-5 h-5 text-purple-500" />,
    "Total Likes": <Heart className="w-5 h-5 text-red-500" />,
    "Total Comments": <MessageSquare className="w-5 h-5 text-yellow-500" />,
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [playlistRes, videoRes] = await Promise.all([
          API.get(`/users/analytics/playlist`, { withCredentials: true }),
          API.get(`/users/analytics/playlist/videos`, { withCredentials: true }),
        ]);
        
        setAnalyticsData({
          playlists: playlistRes.data?.data || [],
          videos: videoRes.data?.data?.viewsPerVideo || [],
          totals: {
            totalVideos: videoRes.data?.data?.totalVideos || 0,
            totalViews: videoRes.data?.data?.totalViews || 0,
            totalLikes: videoRes.data?.data?.totalLikes || 0,
            totalComments: videoRes.data?.data?.totalComments || 0
          }
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Calculate statistics
  const stats = [
    { label: "Total Playlists", value: analyticsData.playlists.length },
    { label: "Total Videos", value: analyticsData.totals.totalVideos },
    { label: "Total Views", value: analyticsData.totals.totalViews },
    { 
      label: "Avg. Views", 
      value: analyticsData.videos.length > 0 
        ? Math.round(analyticsData.totals.totalViews / analyticsData.videos.length) 
        : 0 
    },
    { label: "Total Likes", value: analyticsData.totals.totalLikes },
    { label: "Total Comments", value: analyticsData.totals.totalComments }
  ];

  // Prepare chart data
  const playlistBarData = analyticsData.playlists
    .map((p, idx) => ({
      name: p.name || `Playlist ${idx + 1}`,
      views: p.totalViews || 0,
      videos: p.videoCount || 0,
      id: p._id || idx,
      playlistId: p.playlistId || p._id // Ensure we have playlistId for navigation
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const videoBarData = analyticsData.videos
    .map((video) => ({
      name: video.title || "Untitled Video",
      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || 0,
      id: video.videoId,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#F59E0B', '#10B981', '#3B82F6'];

  // Navigation handlers
  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlists/${playlistId}`);
  };

  const handleVideoClick = () => {
    navigate(`/video`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
      </div>
    );
  }

  if (!analyticsData.playlists.length && !analyticsData.videos.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-6 text-center">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
          <BarChart2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          No analytics data available
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          You don't have any playlists or videos with analytics data yet. Create your first playlist to get started.
        </p>
        <button
          onClick={() => navigate("/playlist")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Playlist</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Content Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track performance of your playlists and videos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {["all", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  timeRange === range
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {range === "all" ? "All Time" : range === "7d" ? "7 Days" : "30 Days"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("playlists")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === "playlists"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === "videos"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Videos
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {statIcons[stat.label]}
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        {/* Chart Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTab === "playlists" ? "Top Playlists by Views" : "Top Videos by Views"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {activeTab === "playlists" 
                ? `${analyticsData.playlists.length} playlists analyzed` 
                : `${analyticsData.videos.length} videos analyzed`}
            </p>
          </div>
          <button
            onClick={() => navigate("/playlist")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Content</span>
          </button>
        </div>

        {/* Chart Container */}
        <div className="p-4 md:p-6">
          {activeTab === "playlists" ? (
            playlistBarData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={playlistBarData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="#E5E7EB"
                      strokeOpacity={0.2}
                    />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickFormatter={(name) => 
                        name.length > 15 ? `${name.substring(0, 13)}...` : name
                      }
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "#6B7280" }} 
                      tickMargin={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E7EB',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        color: '#111827'
                      }}
                      formatter={(value, name) => [value.toLocaleString(), name === 'views' ? 'Views' : 'Videos']}
                      labelFormatter={(label) => `Playlist: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="views" 
                      name="Views"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                      fill="#6366F1"
                    />
                    <Bar 
                      dataKey="videos" 
                      name="Videos"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                      fill="#8B5CF6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <BarChart2 className="h-10 w-10 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  No playlist data available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Your playlists don't have any views yet. Share them to start tracking performance.
                </p>
              </div>
            )
          ) : (
            videoBarData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={videoBarData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="#E5E7EB"
                      strokeOpacity={0.2}
                    />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickFormatter={(name) => 
                        name.length > 15 ? `${name.substring(0, 13)}...` : name
                      }
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "#6B7280" }} 
                      tickMargin={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E7EB',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        color: '#111827'
                      }}
                      formatter={(value, name) => {
                        const label = name === 'views' ? 'Views' : 
                                     name === 'likes' ? 'Likes' : 'Comments';
                        return [value.toLocaleString(), label];
                      }}
                      labelFormatter={(label) => `Video: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="views" 
                      name="Views"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                      fill="#6366F1"
                    />
                    <Bar 
                      dataKey="likes" 
                      name="Likes"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                      fill="#EC4899"
                    />
                    <Bar 
                      dataKey="comments" 
                      name="Comments"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                      fill="#F59E0B"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <Film className="h-10 w-10 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  No video data available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Your videos don't have any views yet. Add them to playlists and share to track performance.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Top Performers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Playlists */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-500" />
              Top Playlists
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {playlistBarData.slice(0, 5).map((playlist, index) => (
              <div
                key={index}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handlePlaylistClick(playlist.playlistId || playlist.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {playlist.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {playlist.views.toLocaleString()} views • {playlist.videos} videos
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Videos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-blue-500" />
              Top Videos
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {videoBarData.slice(0, 5).map((video, index) => (
              <div
                key={index}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleVideoClick(video.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {video.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {video.views.toLocaleString()} views • {video.likes} likes
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPlaylistsPage;