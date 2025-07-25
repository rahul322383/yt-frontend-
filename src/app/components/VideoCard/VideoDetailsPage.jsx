/* eslint-disable no-unused-vars */
// /* eslint-disable no-unused-vars */
// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import ReactPlayer from "react-player";
// import API from "../../../utils/axiosInstance.jsx";
// import SubscriptionButton from "../VideoCard/SubscriptionButton.jsx";
// import LikeButton from "../VideoCard/likeButton.jsx";
// import ShareButton from "../VideoCard/ShareCard.jsx";
// import CommentSection from "../VideoCard/CommentSection.jsx";
// import { toast } from "react-hot-toast";
// import { FaRandom, FaClock, FaPlay, FaPause, FaEdit, FaTrash } from "react-icons/fa";
// import { IoMdClose } from "react-icons/io";

// const VideoDetailPage = () => {
//   const { id: videoId } = useParams();
//   const navigate = useNavigate();
//   const activeVideoRef = useRef(null);

//   const [channel , setChannel] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [video, setVideo] = useState(null);
//   const [playlistVideos, setPlaylistVideos] = useState([]);
//   const [autoplay, setAutoplay] = useState(() => JSON.parse(localStorage.getItem("autoplay")) ?? true);
//   const [shuffle, setShuffle] = useState(() => JSON.parse(localStorage.getItem("shuffle")) ?? false);
//   const [watchLater, setWatchLater] = useState(() => {
//     const stored = JSON.parse(localStorage.getItem("watchLater")) || [];
//     return stored.includes(videoId);
//   });
//   const [showComments, setShowComments] = useState(false);
//   const channelId = video?.channelId;

//   useEffect(() => {
//     localStorage.setItem("autoplay", JSON.stringify(autoplay));
//     localStorage.setItem("shuffle", JSON.stringify(shuffle));
//   }, [autoplay, shuffle]);

//   const token = localStorage.getItem("accessToken");

//   const fetchVideo = async () => {
//     try {
//       const res = await API.get(`/user/playlist/videos/${videoId}`);
//       if (res?.data?.success) {
//         setVideo(res.data.data.video);
//         setPlaylistVideos(res.data.data.playlistVideos);
        
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
//   const fetchUser = async () => {
//   try {
//     const res = await API.get("/users/me");
//     setUser(res.data?.user);
//   } catch (err) {
//     console.error("Failed to fetch user", err);
//   }
// };


//   const handleEnded = () => {
//     if (!autoplay) return;
//     const list = shuffle ? [...playlistVideos].sort(() => 0.5 - Math.random()) : playlistVideos;
//     const currentIndex = list.findIndex((v) => v._id === videoId);
//     if (currentIndex !== -1 && currentIndex < list.length - 1) {
//       const nextVideo = list[currentIndex + 1];
//       navigate(`/video/${nextVideo._id}`);
//     }
//   };

//   const checkWatchLater = async () => {
//     try {
//       const res = await API.get("/users/me");
//       const userWatchLater = res.data?.user?.watchLater || [];
//       setWatchLater(userWatchLater.includes(videoId));
//     } catch (err) {
//       console.error("Watch later check failed", err);
//     }
//   };

//   useEffect(() => {
//     fetchVideo();
//     checkWatchLater();
//      fetchUser();
//   }, [videoId]);

//   const toggleWatchLater = async () => {
//     try {
//       const res = await API.post(`/users/watch-later/${videoId}`);
//       if (res.data.message === "Video already in Watch Later") {
//         toast("Already in Watch Later");
//       } else {
//         toast.success(res.data.message || "Added to Watch Later");
//       }
//       setWatchLater(!watchLater);
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

//   // const handlePlay = async () => {
//   //   try {
//   //     await API.get(`/user/playlist/videos/watch/${videoId}`);
//   //   } catch (err) {
//   //     console.error("Error updating view:", err);
//   //   }
//   // };

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
//                   {video.avatarUrl ? (
//                     <img 
//                       src={video.avatarUrl} 
//                       alt={video.creatorName}
//                       className="w-10 h-10 rounded-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold group-hover:bg-yellow-400 transition">
//                       {video.creatorName?.charAt(0).toUpperCase() || "C"}
//                     </div>
//                   )}
                  
//                   <div>
//                     <p className="font-medium group-hover:text-yellow-400 transition">{video.creatorName || "Unknown Creator"}</p>
//                     <div className="flex gap-2 text-sm text-gray-400">
//                       <span>{video.views} views</span>
//                       <span>•</span>
//                       <span>{new Date(video.createdAt).toLocaleDateString()}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                  <SubscriptionButton
//   channelId={video?.channelId}
//   isSubscribedInitially={user?.subscriptions?.includes(video?.channelId)}
//   subscriberCount={video?.subscriberCount}
// />


//                 </div>
//               </div>

//               {/* Video Description */}
//               {video.description && (
//                 <div className="mt-4 p-4 bg-gray-800 rounded-lg">
//                   <p className="whitespace-pre-wrap">{video.description}</p>
//                 </div>
//               )}

//               {/* Action Buttons */}
//      <div className="flex flex-wrap gap-3 mt-6">
//         <LikeButton
//           videoId={video._id}
//           initialLikeState={video.isLiked || false}
//           initialLikeCount={video.likes || 0}
//           initialDislikeCount={video.dislikes || 0}
//           isAuthenticated={!!user}
//         />



//                 <button
//                   onClick={toggleWatchLater}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-full transition cursor-pointer ${
//                     watchLater 
//                       ? "bg-yellow-500 text-black hover:bg-yellow-400" 
//                       : "bg-gray-700 hover:bg-gray-600"
//                   }`}
//                 >
//                   <FaClock />
//                   <span>{watchLater ? "Saved" : "Watch Later"}</span>
//                 </button>

//                 <button
//                   onClick={toggleAutoplay}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-full transition cursor-pointer  hover:bg-gray-600 ${
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
//                   className={`flex items-center gap-2 px-4 py-2 rounded-full transition cursor-pointer hover:text-amber-400 ${
//                     shuffle 
//                       ? "bg-yellow-500 text-black hover:bg-yellow-400" 
//                       : "bg-gray-700 hover:bg-gray-600"
//                   }`}
//                 >
//                   <FaRandom />
//                   <span>{shuffle ? "Shuffling" : "Shuffle"}</span>
//                 </button>

//                 {/* Share Button */}
//                 <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full transition cursor-pointer ">
//                   <ShareButton videoId={video._id} />
//                   <span>Share</span>
//                 </div>

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

//               {/* Comments Section */}
//               <div className="mt-6">
//                 {!showComments ? (
//                   <button
//                     onClick={() => setShowComments(true)}
//                     className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full transition cursor-pointer"
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

//           {/* Playlist Sidebar */}
//           <div className="w-full lg:w-1/3">
//             <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4 px-2">
//                 <h3 className="text-xl font-bold">More from this playlist</h3>
//                 <span className="text-sm text-gray-400">{playlistVideos.length} videos</span>
//               </div>
//               <div className="space-y-2 px-2">
//                 {(shuffle ? [...playlistVideos].sort(() => 0.5 - Math.random()) : playlistVideos).map((v) => {
//                   const isActive = v._id === videoId;
//                   return (
//                     <div
//                       key={v._id}
//                       ref={isActive ? activeVideoRef : null}
//                       onClick={() => navigate(`/video/${v._id}`)}
//                       className={`flex gap-3 p-3 rounded-lg cursor-pointer transition ${
//                         isActive 
//                           ? "bg-yellow-500/20 border border-yellow-400" 
//                           : "hover:bg-gray-800"
//                       }`}
//                     >
//                       <div className="relative flex-shrink-0 w-40 h-24 rounded-md overflow-hidden">
//                         <video
//                           src={v.videoUrl}
//                           muted
//                           preload="metadata"
//                           loop
//                           onMouseOver={(e) => e.target.play()}
//                           onMouseOut={(e) => e.target.pause()}
//                           className="absolute inset-0 w-full h-full object-cover"
//                         />
//                         {isActive && (
//                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                             <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
//                               <FaPlay className="text-black" />
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="font-medium text-sm line-clamp-2">{v.title}</h4>
//                         <p 
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             navigate(`/channel/${v.channelId}`);
//                           }}
//                           className="text-xs text-gray-400 mt-1 hover:text-yellow-400 transition"
//                         >
//                           {v.creatorName || "Unknown Creator"}
//                         </p>
//                         <div className="flex gap-2 text-xs text-gray-400 mt-1">
//                           <span>{v.views} views</span>
//                           <span>•</span>
//                           <span>{new Date(v.createdAt).toLocaleDateString()}</span>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoDetailPage;


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
import { 
  FaRandom, 
  FaClock, 
  FaPlay, 
  FaPause, 
  FaEdit, 
  FaTrash,
  FaEllipsisV
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";

const VideoDetailPage = () => {
  const { id: videoId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const sidebarRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [video, setVideo] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [autoplay, setAutoplay] = useState(() => 
    JSON.parse(localStorage.getItem("autoplay")) ?? true
  );
  const [shuffle, setShuffle] = useState(() => 
    JSON.parse(localStorage.getItem("shuffle")) ?? false
  );
  const [watchLater, setWatchLater] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSidebarSticky, setIsSidebarSticky] = useState(true);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("autoplay", JSON.stringify(autoplay));
    localStorage.setItem("shuffle", JSON.stringify(shuffle));
  }, [autoplay, shuffle]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [videoRes, userRes] = await Promise.all([
        API.get(`/user/playlist/videos/${videoId}`),
        
        
      ]);

      if (videoRes?.data?.success) {
        setVideo(videoRes.data.data.video);
        setPlaylistVideos(videoRes.data.data.playlistVideos);
        console.log(videoRes.data.data.playlistVideos);
        setWatchLater(userRes.data?.user?.watchLater?.includes(videoId) || false );
      } else {
        toast.error("Video not found");
      }
      
      if (userRes.data?.user) {
        setUser(userRes.data.user);
        console.log(userRes.data.user);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnded = () => {
    if (!autoplay || !playlistVideos.length) return;
    
    const list = shuffle 
      ? [...playlistVideos].sort(() => 0.5 - Math.random()) 
      : playlistVideos;
      
    const currentIndex = list.findIndex(v => v._id === videoId);
    if (currentIndex < list.length - 1) {
      navigate(`/video/${list[currentIndex + 1]._id}`);
    }
  };

  const toggleWatchLater = async () => {
    try {
      const res = await API.post(`/users/watch-later/${videoId}`);
      
      setWatchLater(!watchLater);
      toast.success(watchLater ? "Removed from Watch Later" : "Added to Watch Later");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update Watch Later");
    }
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
    toast.success(`Shuffle ${!shuffle ? "enabled" : "disabled"}`);
  };

  const toggleAutoplay = () => {
    setAutoplay(!autoplay);
    toast.success(`Autoplay ${!autoplay ? "enabled" : "disabled"}`);
  };

  const handleEdit = () => navigate(`/edit-video/${videoId}`);
  
  const handleDelete = async () => {
    if (!window.confirm("Delete this video permanently?")) return;
    try {
      await API.delete(`/videos/${videoId}`);
      toast.success("Video deleted");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete video");
    }
  };

  // Handle sidebar sticky behavior on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current) {
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        setIsSidebarSticky(sidebarRect.top >= 20);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, [videoId]);

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
          {/* Main Content (70% width on lg+) */}
          <div className="w-full lg:w-[70%]">
            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg">
              <ReactPlayer
                ref={playerRef}
                url={video.videoUrl}
                controls
                width="100%"
                height="100%"
                onEnded={handleEnded}
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload"
                    }
                  }
                }}
                className="react-player"
              />
            </div>

            {/* Video Info */}
            <div className="mt-6">
              <h1 className="text-2xl md:text-3xl font-bold break-words">
                {video.title}
              </h1>
              
              {/* Channel Info and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => navigate(`/channel/${video.channelId}`)}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                    {video.avatarUrl ? (
                      <img 
                        src={video.avatarUrl} 
                        alt={video.creatorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-yellow-500 text-black font-bold text-xl">
                        {video.creatorName?.charAt(0).toUpperCase() || "C"}
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <p className="font-medium group-hover:text-yellow-400 transition truncate">
                      {video.creatorName || "Unknown Creator"}
                    </p>
                    <div className="flex gap-2 text-sm text-gray-400">
                      <span>{video.views?.toLocaleString()} views</span>
                      <span>•</span>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <SubscriptionButton
                    channelId={video.channelId}
                    isSubscribedInitially={user?.subscriptions?.includes(video.channelId)}
                    subscriberCount={video.subscriberCount}
                  />
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 rounded-full hover:bg-gray-700 transition"
                    >
                      <BsThreeDotsVertical className="text-xl" />
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
                        <button
                          onClick={toggleWatchLater}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-700"
                        >
                          <FaClock className="text-yellow-500" />
                          {watchLater ? "Remove from Watch Later" : "Save to Watch Later"}
                        </button>
                        {video.isOwner && (
                          <>
                            <button
                              onClick={handleEdit}
                              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-700"
                            >
                              <FaEdit className="text-blue-500" />
                              Edit Video
                            </button>
                            <button
                              onClick={handleDelete}
                              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-700 text-red-500"
                            >
                              <FaTrash />
                              Delete Video
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Description */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Description</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-gray-300">
                  {video.description || "No description provided"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <LikeButton
                  videoId={video._id}
                  initialLikeState={video.isLiked}
                  initialLikeCount={video.likes}
                  initialDislikeCount={video.dislikes}
                  isAuthenticated={!!user}
                />

                <button
                  onClick={toggleAutoplay}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                    autoplay 
                      ? "bg-yellow-500 text-black hover:bg-yellow-400" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {autoplay ? <FaPause /> : <FaPlay />}
                  <span>Autoplay</span>
                </button>

                {playlistVideos.length > 0 && (
                  <button
                    onClick={toggleShuffle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                      shuffle 
                        ? "bg-yellow-500 text-black hover:bg-yellow-400" 
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <FaRandom />
                    <span>Shuffle</span>
                  </button>
                )}

                <ShareButton 
                  videoId={video._id} 
                  className="bg-blue-600 hover:bg-blue-500"
                />
              </div>

              {/* Comments Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    Comments ({video.commentCount || 0})
                  </h3>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="text-yellow-500 hover:text-yellow-400 transition"
                  >
                    {showComments ? "Hide Comments" : "Show Comments"}
                  </button>
                </div>

                {showComments && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <CommentSection 
                      videoId={video._id} 
                      currentUser={user}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playlist Sidebar (30% width on lg+) */}
          <div 
            ref={sidebarRef}
            className={`w-full lg:w-[30%] ${isSidebarSticky ? 'lg:sticky lg:top-4' : ''}`}
          >
            <div className={`bg-gray-800/50 rounded-xl p-4 ${isSidebarSticky ? 'lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Up Next</h3>
                <span className="text-sm text-gray-400">
                  {playlistVideos.length} videos
                </span>
              </div>
              
              <div className="space-y-3">
                {(shuffle ? [...playlistVideos].sort(() => 0.5 - Math.random()) : playlistVideos)
                  .filter(v => v._id !== videoId)
                  .slice(0, 10) // Limit to 10 videos
                  .map((v) => (
                    <div
                      key={v._id}
                      onClick={() => navigate(`/video/${v._id}`)}
                      className="flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700/50 transition group"
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
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs rounded">
                          {v.duration || "0:00"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-yellow-400 transition">
                          {v.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 hover:text-yellow-400 transition">
                          {v.creatorName || "Unknown Creator"}
                        </p>
                        <div className="flex gap-2 text-xs text-gray-400 mt-1">
                          <span>{v.views?.toLocaleString()} views</span>
                          <span>•</span>
                          <span>
                            {new Date(v.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;