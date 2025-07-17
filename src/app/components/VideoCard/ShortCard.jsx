// ShortsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axiosInstance.jsx";
import ShareCard from "../../components/VideoCard/ShareCard.jsx";
import CommentSection from "../../components/VideoCard/CommentSection.jsx";
import { toast } from "react-toastify";

const ShortsPage = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const startYRef = useRef(0);
  const navigate = useNavigate();

  const fetchVideos = async () => {
    try {
      const res = await API.get("/users/shorts/all");
      setVideos(res.data);
      videoRefs.current = new Array(res.data.length);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleLike = async (id, index) => {
    const isLoggedIn = !!localStorage.getItem("token") || !!localStorage.getItem("sessionId");
    if (!isLoggedIn) {
      toast.info("Please sign in to like videos.");
      return setTimeout(() => navigate("/login"), 1200);
    }

    try {
      const res = await API.put(`/users/shorts/like/${id}`);
      const updated = [...videos];
      updated[index].likes = res.data.likes;
      updated[index].isLiked = res.data.isLiked;
      setVideos(updated);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const loadMoreVideos = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await API.get(`/users/shorts/trend?page=${Math.floor(videos.length / 10) + 1}`);
      setVideos((prev) => [...prev, ...res.data]);
      videoRefs.current = [...videoRefs.current, ...new Array(res.data.length)];
    } catch (error) {
      console.error("Error loading more videos:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) > 50) {
      setCurrentIndex((prev) => Math.max(0, Math.min(prev + (e.deltaY > 0 ? 1 : -1), videos.length - 1)));
    }
  };

  const onTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    const diffY = startYRef.current - e.changedTouches[0].clientY;
    if (Math.abs(diffY) > 50) {
      setCurrentIndex((prev) => Math.max(0, Math.min(prev + (diffY > 0 ? 1 : -1), videos.length - 1)));
    }
  };

  const toggleComments = (id) => {
    setShowCommentsFor((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loadingMore) {
        loadMoreVideos();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, videos.length]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        index === currentIndex ? video.play().catch(console.log) : video.pause();
      }
    });

    videoRefs.current[currentIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentIndex]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={handleWheel}
    >
      {videos.map((video, index) => (
        <div
          key={video._id || index}
          className="snap-start w-full h-screen relative flex items-center justify-center"
        >
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            src={video.videoUrl}
            className="w-[360px] h-[640px] object-cover rounded-xl shadow-lg"
            autoPlay={index === currentIndex}
            loop
            muted
            playsInline
          />

          {index === currentIndex && (
            <>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-lg font-semibold">{video.title}</h2>
                <p className="text-sm opacity-90">{video.uploadedBy || "Anonymous"}</p>
                <p className="text-xs opacity-80 mt-1">{video.description}</p>
              </div>

              <div className="absolute right-4 bottom-28 flex flex-col items-center space-y-6 z-20 text-white">
                <button
                  onClick={() => handleLike(video._id, index)}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    video.isLiked ? "text-red-500 scale-110" : "hover:scale-110"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 mb-1"
                    fill={video.isLiked ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 9V5a3 3 0 00-6 0v4H5.28a1 1 0 00-.95 1.32l1.7 5.1a1 1 0 00.95.68h9.04a1 1 0 00.95-.68l1.7-5.1a1 1 0 00-.95-1.32H14z"
                    />
                  </svg>
                  <span className="text-xs">{video.likes || 0}</span>
                </button>

                <button
                  onClick={() => toggleComments(video._id)}
                  className="hover:scale-110 transition-transform flex flex-col items-center"
                >
                  <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v8l-4-4H7a2 2 0 01-2-2V6a2 2 0 012-2h8"
                    />
                  </svg>
                  <span className="text-xs">{video.comments?.length || 0}</span>
                </button>

                <ShareCard videoId={video._id} />
              </div>
            </>
          )}

          {showCommentsFor === video._id && index === currentIndex && (
            <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-black z-30 p-4 overflow-y-auto rounded-t-xl shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-semibold text-white">Comments</h3>
                <button onClick={() => setShowCommentsFor(null)} className="text-white text-xl">✖</button>
              </div>
              <CommentSection videoId={video._id} />
            </div>
          )}
        </div>
      ))}

      {loadingMore && (
        <div className="w-full py-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ShortsPage;
