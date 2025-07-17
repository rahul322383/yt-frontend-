import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axiosInstance.jsx";
import LikeButton from "../VideoCard/likeButton.jsx";
import VideoDetailPage from "../VideoCard/VideoDetailsPage.jsx";

const VideoCardSkeleton = () => (
  <div className="flex gap-4 border rounded-xl p-4 shadow-sm animate-pulse bg-gray-100 dark:bg-gray-700">
    <div className="w-40 h-24 bg-gray-300 rounded-lg" />
    <div className="flex-1 space-y-3 py-1">
      <div className="h-5 bg-gray-300 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

// ChannelAvatar with skeleton loader
const ChannelAvatar = ({ src, username }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse dark:bg-gray-600" />
      )}
      <img
        src={src}
        alt={`${username}'s avatar`}
        className={`w-8 h-8 rounded-full object-cover ${loaded ? "block" : "hidden"}`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </>
  );
};

const VideoCard = ({
  video,
  onVideoClick,
  onChannelClick,
  onWatchLaterToggle,
  watchLaterList,
}) => {
  const [hover, setHover] = useState(false);
  const [muted, setMuted] = useState(true);

  const isWatchLater = watchLaterList.includes(video._id);

  return (
    <div
      className="flex gap-3 sm:gap-4 border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-900 relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      tabIndex={0}
      role="button"
      onClick={() => onVideoClick(video)}
    >
      {/* Video Preview */}
      <div className="relative w-32 sm:w-44 h-20 sm:h-28 flex-shrink-0 rounded-md overflow-hidden">
        <video
          src={video.videoUrl}
          className="absolute w-full h-full object-cover"
          autoPlay={hover}
          muted={muted}
          loop
          playsInline
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMuted(!muted);
          }}
          className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      {/* Meta info */}
      <div className="flex flex-col justify-between flex-1">
        <div className="mb-1">
          <h3 className="text-base sm:text-lg font-semibold line-clamp-2 dark:text-white">
            {video.title}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2 mt-1">
            <span>{video.views.toLocaleString()} views</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black cursor-pointer dark:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onChannelClick(video);
            }}
          >
            <ChannelAvatar
              src={video.owner?.avatar}
              username={video.owner?.username}
            />
            <span>{video.owner?.username}</span>
          </div>

          <div className="flex gap-2 items-center text-xs">
            <LikeButton videoId={video._id} initialLikes={video.likeCount} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWatchLaterToggle(video._id);
              }}
              className={`px-2 py-1 rounded-full text-white ${
                isWatchLater
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isWatchLater ? "✓" : "+"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const Video = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [watchLaterList, setWatchLaterList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const limit = 10;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/videos", {
        params: { search, page, limit },
        withCredentials: true,
      });
      const grouped = {};
      for (const video of res.data.data.videos) {
        const pid = video.playlistId?.[0] || "standalone";
        if (!grouped[pid]) grouped[pid] = video;
      }
      setVideos(Object.values(grouped));
      setTotal(Object.keys(grouped).length);
      setWatchLaterList(res.data.data.watchLaterList || []);
      setSelectedVideo(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [search, page]);

  const totalPages = Math.ceil(total / limit);

  // Watch Later toggle with backend syncing
  const onWatchLaterToggle = async (videoId) => {
    try {
      if (watchLaterList.includes(videoId)) {
        // Remove
        await API.delete(`/users/watch-later/${videoId}`, { withCredentials: true });
        setWatchLaterList((prev) => prev.filter((id) => id !== videoId));
      } else {
        // Add
        await API.post(`/users/watch-later/${videoId}`, {}, { withCredentials: true });
        setWatchLaterList((prev) => [...prev, videoId]);
      }
    } catch (err) {
      alert("Failed to update Watch Later");
    }
  };

  const handleVideoClick = (video) => {
    if (video.playlistId?.[0]) {
      navigate(`/playlists/${video.playlistId[0]}`);
    } else {
      setSelectedVideo(video);
      navigate(`/video/${video._id}`);
    }
  };

  const handleChannelClick = (video) => {
    const channelId = video.channelId || video.owner?._id;
    if (channelId) {
      navigate(`/channel/${channelId}`);
    } else {
      console.error("Channel ID not found for video:", video);
    }
  };

  // Get first playlist ID for Play All button
  const firstPlaylistId =
    videos.find((v) => v.playlistId?.[0])?.playlistId?.[0] || null;

  return (
    <main className="max-w-6xl mx-auto p-6 relative bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Dark Mode toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setDarkMode((d) => !d)}
          className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <input
          type="search"
          placeholder="Search videos..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-lg border border-gray-300 rounded-md p-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          aria-label="Search videos"
        />
      </div>

      {/* Playlist Play All button */}
      {firstPlaylistId && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate(`/playlists/${firstPlaylistId}`)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Play all videos in this playlist"
          >
            ▶️ Play All
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg">
          No videos found.
        </p>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onVideoClick={handleVideoClick}
              onChannelClick={handleChannelClick}
              onWatchLaterToggle={onWatchLaterToggle}
              watchLaterList={watchLaterList}
            />
          ))}
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 rounded-md bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition dark:bg-gray-700 dark:hover:bg-gray-600"
            aria-label="Previous page"
          >
            Prev
          </button>
          <span className="text-gray-700 font-medium dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2 rounded-md bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition dark:bg-gray-700 dark:hover:bg-gray-600"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}

      {selectedVideo && (
        <VideoDetailPage
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </main>
  );
};

export default Video;
