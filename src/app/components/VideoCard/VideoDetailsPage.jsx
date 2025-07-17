/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import API from "../../../utils/axiosInstance.jsx";
import SubscriptionButton from "../VideoCard/SubscriptionButton.jsx";
import LikeButton from "../VideoCard/likeButton.jsx";
import ShareButton from "../VideoCard/ShareCard.jsx";
import CommentSection from "../VideoCard/CommentSection.jsx";
import { toast } from "react-hot-toast";
import { FaRandom, FaClock, FaPlay, FaPause, FaEdit, FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const VideoDetailPage = () => {
  const { id: videoId } = useParams();
  const navigate = useNavigate();
  const activeVideoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [video, setVideo] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [autoplay, setAutoplay] = useState(() => JSON.parse(localStorage.getItem("autoplay")) ?? true);
  const [shuffle, setShuffle] = useState(() => JSON.parse(localStorage.getItem("shuffle")) ?? false);
  const [watchLater, setWatchLater] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("watchLater")) || [];
    return stored.includes(videoId);
  });
  const [showComments, setShowComments] = useState(false);

  const fetchVideo = async () => {
    try {
      const res = await API.get(`/user/playlist/videos/${videoId}`);
      if (res?.data?.success) {
        setVideo(res.data.data.video);
        setPlaylistVideos(res.data.data.playlistVideos);
      } else {
        toast.error("Video not found.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load video.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnded = () => {
    if (!autoplay) return;
    const list = shuffle ? [...playlistVideos].sort(() => 0.5 - Math.random()) : playlistVideos;
    const currentIndex = list.findIndex((v) => v._id === videoId);
    if (currentIndex !== -1 && currentIndex < list.length - 1) {
      const nextVideo = list[currentIndex + 1];
      navigate(`/video/${nextVideo._id}`);
    }
  };

  const checkWatchLater = async () => {
    try {
      const res = await API.get("/users/me");
      const userWatchLater = res.data?.user?.watchLater || [];
      setWatchLater(userWatchLater.includes(videoId));
    } catch (err) {
      console.error("Watch later check failed", err);
    }
  };

  useEffect(() => {
    fetchVideo();
    checkWatchLater();
  }, [videoId]);

  const toggleWatchLater = async () => {
    try {
      const res = await API.post(`/users/watch-later/${videoId}`);
      if (res.data.message === "Video already in Watch Later") {
        toast("Already in Watch Later");
      } else {
        toast.success(res.data.message || "Added to Watch Later");
      }
      setWatchLater(!watchLater);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === "Invalid video ID") {
        toast.error("Invalid video");
      } else if (msg === "User not found") {
        toast.error("Login required");
      } else {
        console.error(err);
        toast.error("Failed to update Watch Later");
      }
    }
  };

  const toggleShuffle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    localStorage.setItem("shuffle", JSON.stringify(newShuffle));
  };

  const toggleAutoplay = () => {
    const newAutoplay = !autoplay;
    setAutoplay(newAutoplay);
    localStorage.setItem("autoplay", JSON.stringify(newAutoplay));
  };

  const handlePlay = async () => {
    try {
      await API.get(`/user/playlist/videos/${videoId}/watch`);
    } catch (err) {
      console.error("Error updating view:", err);
    }
  };

  const handleEdit = () => {
    navigate(`/edit-video/${videoId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      const res = await API.delete(`/videos/${videoId}`);
      if (res?.data?.success) {
        toast.success("Video deleted.");
        navigate("/");
      } else {
        toast.error("Failed to delete video.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting video.");
    }
  };

  useEffect(() => {
    if (activeVideoRef.current) {
      activeVideoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [playlistVideos, videoId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  );

  if (!video) return (
    <div className="flex items-center justify-center min-h-screen text-white text-xl">
      Video not found
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden">
              <ReactPlayer
                url={video.videoUrl}
                controls
                width="100%"
                height="100%"
                onPlay={handlePlay}
                onEnded={handleEnded}
                className="absolute top-0 left-0"
              />
            </div>

            {/* Video Info */}
            <div className="mt-4">
              <h1 className="text-2xl font-bold">{video.title}</h1>
              
              {/* Channel Info and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => navigate(`/channel/${video.channelId}`)}
                >
                  {video.avatarUrl ? (
                    <img 
                      src={video.avatarUrl} 
                      alt={video.creatorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold group-hover:bg-yellow-400 transition">
                      {video.creatorName?.charAt(0).toUpperCase() || "C"}
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium group-hover:text-yellow-400 transition">{video.creatorName || "Unknown Creator"}</p>
                    <div className="flex gap-2 text-sm text-gray-400">
                      <span>{video.views} views</span>
                      <span>•</span>
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <SubscriptionButton
                    channelId={video.channelId}
                    isSubscribedInitially={video.subscribed}
                  />
                </div>
              </div>

              {/* Video Description */}
              {video.description && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <p className="whitespace-pre-wrap">{video.description}</p>
                </div>
              )}

              {/* Action Buttons */}
     <div className="flex flex-wrap gap-3 mt-6">
        <LikeButton
          videoId={video._id}
          initialLikeState={video.isLiked || false}
          initialLikeCount={video.likes || 0}
          initialDislikeCount={video.dislikes || 0}
          isAuthenticated={!!user}
        />



                <button
                  onClick={toggleWatchLater}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition cursor-pointer ${
                    watchLater 
                      ? "bg-yellow-500 text-black hover:bg-yellow-400" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <FaClock />
                  <span>{watchLater ? "Saved" : "Watch Later"}</span>
                </button>

                <button
                  onClick={toggleAutoplay}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition cursor-pointer  hover:bg-gray-600 ${
                    autoplay 
                      ? "bg-yellow-500 text-black hover:bg-yellow-400" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {autoplay ? <FaPause /> : <FaPlay />}
                  <span>{autoplay ? "Autoplay On" : "Autoplay Off"}</span>
                </button>

                <button
                  onClick={toggleShuffle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition cursor-pointer hover:text-amber-400 ${
                    shuffle 
                      ? "bg-yellow-500 text-black hover:bg-yellow-400" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <FaRandom />
                  <span>{shuffle ? "Shuffling" : "Shuffle"}</span>
                </button>

                {/* Share Button */}
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full transition cursor-pointer ">
                  <ShareButton videoId={video._id} />
                  <span>Share</span>
                </div>

                {video.isOwner && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full transition"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full transition"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>

              {/* Comments Section */}
              <div className="mt-6">
                {!showComments ? (
                  <button
                    onClick={() => setShowComments(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full transition cursor-pointer"
                  >
                    <span>💬</span>
                    <span>Show Comments ({video.commentCount || 0})</span>
                  </button>
                ) : (
                  <div className="relative p-4 bg-gray-800 rounded-lg">
                    <button
                      onClick={() => setShowComments(false)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700 transition"
                    >
                      <IoMdClose className="text-xl" />
                    </button>
                    
                    <CommentSection videoId={video._id} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold">More from this playlist</h3>
                <span className="text-sm text-gray-400">{playlistVideos.length} videos</span>
              </div>
              <div className="space-y-2 px-2">
                {(shuffle ? [...playlistVideos].sort(() => 0.5 - Math.random()) : playlistVideos).map((v) => {
                  const isActive = v._id === videoId;
                  return (
                    <div
                      key={v._id}
                      ref={isActive ? activeVideoRef : null}
                      onClick={() => navigate(`/video/${v._id}`)}
                      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition ${
                        isActive 
                          ? "bg-yellow-500/20 border border-yellow-400" 
                          : "hover:bg-gray-800"
                      }`}
                    >
                      <div className="relative flex-shrink-0 w-40 h-24 rounded-md overflow-hidden">
                        <video
                          src={v.videoUrl}
                          muted
                          preload="metadata"
                          loop
                          onMouseOver={(e) => e.target.play()}
                          onMouseOut={(e) => e.target.pause()}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                              <FaPlay className="text-black" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{v.title}</h4>
                        <p 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/channel/${v.channelId}`);
                          }}
                          className="text-xs text-gray-400 mt-1 hover:text-yellow-400 transition"
                        >
                          {v.creatorName || "Unknown Creator"}
                        </p>
                        <div className="flex gap-2 text-xs text-gray-400 mt-1">
                          <span>{v.views} views</span>
                          <span>•</span>
                          <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;



// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import ReactPlayer from "react-player";
// import API from "../../../utils/axiosInstance.jsx";
// import SubscriptionButton from "../VideoCard/SubscriptionButton.jsx";
// import LikeButton from "../VideoCard/likeButton.jsx";
// import ShareCard from "../VideoCard/ShareCard.jsx";
// import CommentSection from "../VideoCard/CommentSection.jsx";
// import { toast } from "react-hot-toast";
// import { FaRandom, FaClock, FaPlay, FaPause, FaEdit, FaTrash } from "react-icons/fa";
// import { IoMdClose } from "react-icons/io";

// const VideoDetailPage = () => {
//   const { id: videoId } = useParams();
//   const navigate = useNavigate();
//   const activeVideoRef = useRef(null);

//   const [loading, setLoading] = useState(true);
//   const [video, setVideo] = useState({});
//   const [playlistVideos, setPlaylistVideos] = useState([]);
//   const [autoplay, setAutoplay] = useState(() => JSON.parse(localStorage.getItem("autoplay")) ?? true);
//   const [shuffle, setShuffle] = useState(() => JSON.parse(localStorage.getItem("shuffle")) ?? false);
//   const [showComments, setShowComments] = useState(false);

//   const fetchVideo = async () => {
//     try {
//       const res = await API.get(`/user/playlist/videos/${videoId}/watch`);
//       if (res?.data?.success) {
//         setVideo(res.data.data);
        
//         // If video is part of a playlist, fetch playlist videos
//         if (res.data.data.playlistId?.length > 0) {
//           const playlistRes = await API.get(`/user/playlists/${res.data.data.playlistId[0]}`);
//           if (playlistRes?.data?.success) {
//             setPlaylistVideos(playlistRes.data.data);
//           }
//         }
//       } else {
//         toast.error("Video not found.");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load video.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEnded = () => {
//     if (!autoplay) return;
//     const list = shuffle ? [...playlistVideos].sort(() => 0.5 - Math.random()) : playlistVideos;
//     const currentIndex = list.findIndex((v) => v._id === videoId);
//     if (currentIndex !== -1 && currentIndex < list.length - 1) {
//       const nextVideo = list[currentIndex + 1];
//       navigate(`/video/${nextVideo._id}`);
//     }
//   };

//   const toggleWatchLater = async () => {
//     try {
//       const res = await API.post(`/users/watch-later/${videoId}`);
//       if (res.data.message === "Video already in Watch Later") {
//         toast("Already in Watch Later");
//       } else {
//         toast.success(res.data.message || "Added to Watch Later");
//       }
//       setVideo(prev => ({ ...prev, isInWatchLater: !prev.isInWatchLater }));
//     } catch (err) {
//       const msg = err.response?.data?.message;
//       if (msg === "Invalid video ID") {
//         toast.error("Invalid video");
//       } else if (msg === "User not found") {
//         toast.error("Login required");
//       } else {
//         console.error(err);
//         toast.error("Failed to update Watch Later");
//       }
//     }
//   };

//   const toggleShuffle = () => {
//     const newShuffle = !shuffle;
//     setShuffle(newShuffle);
//     localStorage.setItem("shuffle", JSON.stringify(newShuffle));
//   };

//   const toggleAutoplay = () => {
//     const newAutoplay = !autoplay;
//     setAutoplay(newAutoplay);
//     localStorage.setItem("autoplay", JSON.stringify(newAutoplay));
//   };

//   const handlePlay = async () => {
//     try {
//       await API.get(`/videos/${videoId}/watch`);
//     } catch (err) {
//       console.error("Error updating view:", err);
//     }
//   };

//   const handleEdit = () => {
//     navigate(`/edit-video/${videoId}`);
//   };

//   const handleDelete = async () => {
//     if (!window.confirm("Are you sure you want to delete this video?")) return;
//     try {
//       const res = await API.delete(`/videos/${videoId}`);
//       if (res?.data?.success) {
//         toast.success("Video deleted.");
//         navigate("/");
//       } else {
//         toast.error("Failed to delete video.");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error deleting video.");
//     }
//   };

//   useEffect(() => {
//     fetchVideo();
//   }, [videoId]);

//   useEffect(() => {
//     if (activeVideoRef.current) {
//       activeVideoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
//     }
//   }, [playlistVideos, videoId]);

//   if (loading) return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
//     </div>
//   );

//   if (!video) return (
//     <div className="flex items-center justify-center min-h-screen text-white text-xl">
//       Video not found
//     </div>
//   );

//   return (
//     <div className="bg-gray-900 min-h-screen text-gray-100">
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Main Content */}
//           <div className="w-full lg:w-2/3">
//             {/* Video Player */}
//             <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden">
//               <ReactPlayer
//                 url={video.videoUrl}
//                 controls
//                 width="100%"
//                 height="100%"
//                 onPlay={handlePlay}
//                 onEnded={handleEnded}
//                 className="absolute top-0 left-0"
//               />
//             </div>

//             {/* Video Info */}
//             <div className="mt-4">
//               <h1 className="text-2xl font-bold">{video.title}</h1>
              
//               {/* Channel Info and Actions */}
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
//                 <div 
//                   className="flex items-center gap-3 cursor-pointer group"
//                   onClick={() => navigate(`/channel/${video.channelId}`)}
//                 >
//                   {video.owner?.avatar ? (
//                     <img 
//                       src={video.owner.avatar} 
//                       alt={video.owner.username}
//                       className="w-10 h-10 rounded-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold group-hover:bg-yellow-400 transition">
//                       {video.owner?.username?.charAt(0).toUpperCase() || "C"}
//                     </div>
//                   )}
                  
//                   <div>
//                     <p className="font-medium group-hover:text-yellow-400 transition">
//                       {video.owner?.username || "Unknown Creator"}
//                     </p>
//                     <div className="flex gap-2 text-sm text-gray-400">
//                       <span>{video.views} views</span>
//                       <span>•</span>
//                       <span>{new Date(video.createdAt).toLocaleDateString()}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   <SubscriptionButton
//                     channelId={video.channelId}
//                     isSubscribedInitially={video.isSubscribed}
//                   />
//                 </div>
//               </div>

//               {/* Video Description */}
//               {video.description && (
//                 <div className="mt-4 p-4 bg-gray-800 rounded-lg">
//                   <p className="whitespace-pre-wrap">{video.description}</p>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex flex-wrap gap-3 mt-6">
//                 <LikeButton
//                   videoId={video._id}
//                   initialLikeState={video.isLiked}
//                   initialLikeCount={video.likes || 0}
//                   initialDislikeCount={video.dislikes || 0}
//                 />

//                 <button
//                   onClick={toggleWatchLater}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
//                     video.isInWatchLater
//                       ? "bg-yellow-500 text-black hover:bg-yellow-400" 
//                       : "bg-gray-700 hover:bg-gray-600"
//                   }`}
//                 >
//                   <FaClock />
//                   <span>{video.isInWatchLater ? "Saved" : "Watch Later"}</span>
//                 </button>

//                 <button
//                   onClick={toggleAutoplay}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
//                     autoplay 
//                       ? "bg-yellow-500 text-black hover:bg-yellow-400" 
//                       : "bg-gray-700 hover:bg-gray-600"
//                   }`}
//                 >
//                   {autoplay ? <FaPause /> : <FaPlay />}
//                   <span>{autoplay ? "Autoplay On" : "Autoplay Off"}</span>
//                 </button>

//                 <button
//                   onClick={toggleShuffle}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
//                     shuffle 
//                       ? "bg-yellow-500 text-black hover:bg-yellow-400" 
//                       : "bg-gray-700 hover:bg-gray-600"
//                   }`}
//                 >
//                   <FaRandom />
//                   <span>{shuffle ? "Shuffling" : "Shuffle"}</span>
//                 </button>

//                 {video.isOwner && (
//                   <>
//                     <button
//                       onClick={handleEdit}
//                       className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full transition"
//                     >
//                       <FaEdit />
//                       <span>Edit</span>
//                     </button>

//                     <button
//                       onClick={handleDelete}
//                       className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full transition"
//                     >
//                       <FaTrash />
//                       <span>Delete</span>
//                     </button>
//                   </>
//                 )}
//               </div>

//               {/* Share Section */}
//               <div className="mt-6">
//                 <ShareCard videoId={video._id} />
//               </div>

//               {/* Comments Section */}
//               <div className="mt-6">
//                 {!showComments ? (
//                   <button
//                     onClick={() => setShowComments(true)}
//                     className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full transition"
//                   >
//                     <span>💬</span>
//                     <span>Show Comments ({video.commentCount || 0})</span>
//                   </button>
//                 ) : (
//                   <div className="relative p-4 bg-gray-800 rounded-lg">
//                     <button
//                       onClick={() => setShowComments(false)}
//                       className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700 transition"
//                     >
//                       <IoMdClose className="text-xl" />
//                     </button>
//                     <CommentSection videoId={video._id} />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Playlist Sidebar - Only show if there are playlist videos */}
//           {playlistVideos.length > 0 && (
//             <div className="w-full lg:w-1/3">
//               <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
//                 <div className="flex justify-between items-center mb-4 px-2">
//                   <h3 className="text-xl font-bold">More from this playlist</h3>
//                   <span className="text-sm text-gray-400">{playlistVideos.length} videos</span>
//                 </div>
//                 <div className="space-y-2 px-2">
//                   {(shuffle ? [...playlistVideos].sort(() => 0.5 - Math.random()) : playlistVideos).map((v) => {
//                     const isActive = v._id === videoId;
//                     return (
//                       <div
//                         key={v._id}
//                         ref={isActive ? activeVideoRef : null}
//                         onClick={() => navigate(`/video/${v._id}`)}
//                         className={`flex gap-3 p-3 rounded-lg cursor-pointer transition ${
//                           isActive 
//                             ? "bg-yellow-500/20 border border-yellow-400" 
//                             : "hover:bg-gray-800"
//                         }`}
//                       >
//                         <div className="relative flex-shrink-0 w-40 h-24 rounded-md overflow-hidden">
//                           <video
//                             src={v.videoUrl}
//                             muted
//                             preload="metadata"
//                             loop
//                             onMouseOver={(e) => e.target.play()}
//                             onMouseOut={(e) => e.target.pause()}
//                             className="absolute inset-0 w-full h-full object-cover"
//                           />
//                           {isActive && (
//                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                               <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
//                                 <FaPlay className="text-black" />
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h4 className="font-medium text-sm line-clamp-2">{v.title}</h4>
//                           <p 
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               navigate(`/channel/${v.channelId}`);
//                             }}
//                             className="text-xs text-gray-400 mt-1 hover:text-yellow-400 transition"
//                           >
//                             {v.owner?.username || "Unknown Creator"}
//                           </p>
//                           <div className="flex gap-2 text-xs text-gray-400 mt-1">
//                             <span>{v.views} views</span>
//                             <span>•</span>
//                             <span>{new Date(v.createdAt).toLocaleDateString()}</span>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoDetailPage;