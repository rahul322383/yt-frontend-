/* eslint-disable no-unused-vars */

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
// import { 
//   FaRandom, 
//   FaClock, 
//   FaPlay, 
//   FaPause, 
//   FaEdit, 
//   FaTrash,
//   FaEllipsisV
// } from "react-icons/fa";
// import { BsThreeDotsVertical } from "react-icons/bs";

// const VideoDetailPage = () => {
//   const { id: videoId } = useParams();
//   const navigate = useNavigate();
//   const playerRef = useRef(null);
//   const sidebarRef = useRef(null);

//   const [loading, setLoading] = useState(true);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [video, setVideo] = useState(null);
//   const [playlistVideos, setPlaylistVideos] = useState([]);
//   const [autoplay, setAutoplay] = useState(() => 
//     JSON.parse(localStorage.getItem("autoplay")) ?? true
//   );
//   const [shuffle, setShuffle] = useState(() => 
//     JSON.parse(localStorage.getItem("shuffle")) ?? false
//   );
//   const [watchLater, setWatchLater] = useState(false);
//   const [showComments, setShowComments] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [isSidebarSticky, setIsSidebarSticky] = useState(true);
//   const [subscribers, setSubscribers] = useState([]);
  
//   const token = localStorage.getItem("accessToken");
//   const isAuth = !!token;
//   const isGuest = !currentUser;

//   // Check if current user is the owner of the video
//   const isOwner = currentUser?._id === video?.owner?._id;

//   useEffect(() => {
//     fetchData();
//   }, [videoId]);

//   // Save preferences to localStorage
//   useEffect(() => {
//     localStorage.setItem("autoplay", JSON.stringify(autoplay));
//     localStorage.setItem("shuffle", JSON.stringify(shuffle));
//   }, [autoplay, shuffle]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const token = localStorage.getItem("accessToken");

//       // Always fetch the video
//       const videoRes = await API.get(`/user/playlist/videos/${videoId}`);

//       if (videoRes?.data?.success) {
//         setVideo(videoRes.data.data.video);
//         setPlaylistVideos(videoRes.data.data.playlistVideos);
//       } else {
//         toast.error("Video not found");
//       }

//       // Only fetch user if token exists
//       if (token) {
//         const userRes = await API.get("/users/me");
//         setCurrentUser(userRes.data.user); 
//         setWatchLater(userRes.data?.user?.watchLater?.includes(videoId) || false);
//       }

//     } catch (err) {
//       console.error("Fetch error:", err);
//       toast.error(err.response?.data?.message || "Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEnded = () => {
//     if (!autoplay || !playlistVideos.length) return;
    
//     const list = shuffle 
//       ? [...playlistVideos].sort(() => 0.5 - Math.random()) 
//       : playlistVideos;
      
//     const currentIndex = list.findIndex(v => v._id === videoId);
//     if (currentIndex < list.length - 1) {
//       navigate(`/video/${list[currentIndex + 1]._id}`);
//     }
//   };

//   const toggleWatchLater = async () => {
//     try {
//       const res = await API.post(`/users/watch-later/${videoId}`);
      
//       setWatchLater(!watchLater);
//       toast.success(watchLater ? "Removed from Watch Later" : "Added to Watch Later");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to update Watch Later");
//     }
//   };

//   useEffect(() => {
//     if (video?.channelId) {
//       fetchSubscribers(video.channelId);
//     }
//   }, [video]);

//   const fetchSubscribers = async (channelId) => {
//     try {
//       const res = await API.get(`/users/subscribe/channel/${channelId}`);
//       setSubscribers(res.data.data);
//     } catch (err) {
//       toast.error("Error fetching subscribers");
//     }
//   };

//   const toggleShuffle = () => {
//     setShuffle(!shuffle);
//     toast.success(`Shuffle ${!shuffle ? "enabled" : "disabled"}`);
//   };

//   const toggleAutoplay = () => {
//     setAutoplay(!autoplay);
//     toast.success(`Autoplay ${!autoplay ? "enabled" : "disabled"}`);
//   };

//   const handleEdit = () => navigate(`/edit-video/${videoId}`);
  
//   const handleDelete = async () => {
//     if (!window.confirm("Delete this video permanently?")) return;
//     try {
//       await API.delete(`/videos/${videoId}`);
//       toast.success("Video deleted");
//       navigate("/");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete video");
//     }
//   };

//   // Handle sidebar sticky behavior on scroll
//   useEffect(() => {
//     const handleScroll = () => {
//       if (sidebarRef.current) {
//         const sidebarRect = sidebarRef.current.getBoundingClientRect();
//         setIsSidebarSticky(sidebarRect.top >= 20);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

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
//           {/* Main Content (70% width on lg+) */}
//           <div className="w-full lg:w-[70%]">
//             {/* Video Player */}
//             <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg">
//               <ReactPlayer
//                 ref={playerRef}
//                 url={video.videoUrl}
//                 controls
//                 width="100%"
//                 height="100%"
//                 onEnded={handleEnded}
//                 config={{
//                   file: {
//                     attributes: {
//                       controlsList: "nodownload"
//                     }
//                   }
//                 }}
//                 className="react-player"
//               />
//             </div>

//             {/* Video Info */}
//             <div className="mt-6">
//               <h1 className="text-2xl md:text-3xl font-bold break-words">
//                 {video.title}
//               </h1>
              
//               {/* Channel Info and Actions */}
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
//                 <div 
//                   className="flex items-center gap-3 cursor-pointer group"
//                   onClick={() => navigate(`/channel/${video.channelId}`)}
//                 >
//                   <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
//                     {video.avatarUrl ? (
//                       <img 
//                         src={video.avatarUrl} 
//                         alt={video.creatorName}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center bg-yellow-500 text-black font-bold text-xl">
//                         {video.creatorName?.charAt(0).toUpperCase() || "C"}
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="min-w-0">
//                     <p className="font-medium group-hover:text-yellow-400 transition truncate">
//                       {video.creatorName || "Unknown Creator"}
//                     </p>
//                     <div className="flex gap-2 text-sm text-gray-400">
//                       <span>{video.views?.toLocaleString()} views</span>
//                       <span>•</span>
//                       <span>
//                         {new Date(video.createdAt).toLocaleDateString('en-US', {
//                           year: 'numeric',
//                           month: 'short',
//                           day: 'numeric'
//                         })}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex gap-3 items-center">
//                   <SubscriptionButton
//                     channelId={video?.channelId}
//                     isSubscribedInitially={video?.isSubscribed}
//                     isNotifiedInitially={video?.notificationEnabled}
//                     subscriberCount={video?.subscriberCount || 0}
//                     isOwnChannel={isOwner}
//                   />
//                   <div className="relative">
//                     <button 
//                       onClick={() => setShowMenu(!showMenu)}
//                       className="p-2 rounded-full hover:bg-gray-700 transition"
//                     >
//                       <BsThreeDotsVertical className="text-xl" />
//                     </button>
                    
//                     {showMenu && (
//                       <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
//                         {isAuth && (
//                           <button
//                             onClick={toggleWatchLater}
//                             className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-700"
//                           >
//                             <FaClock className="text-yellow-500" />
//                             {watchLater ? "Remove from Watch Later" : "Save to Watch Later"}
//                           </button>
//                         )}
//                         {isOwner && (
//                           <>
//                             <button
//                               onClick={handleEdit}
//                               className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-700"
//                             >
//                               <FaEdit className="text-blue-500" />
//                               Edit Video
//                             </button>
//                             <button
//                               onClick={handleDelete}
//                               className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-700 text-red-500"
//                             >
//                               <FaTrash />
//                               Delete Video
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Video Description */}
//               <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
//                 <div className="flex justify-between items-center mb-2">
//                   <h3 className="font-semibold">Description</h3>
//                   <span className="text-sm text-gray-400">
//                     {new Date(video.createdAt).toLocaleDateString()}
//                   </span>
//                 </div>
//                 <p className="whitespace-pre-wrap text-gray-300">
//                   {video.description || "No description provided"}
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-wrap gap-3 mt-6">
//                 <LikeButton
//                   videoId={video._id}
//                   initialLikeState={video.isLiked}
//                   initialLikeCount={video.likes}
//                   initialDislikeCount={video.dislikes}
//                   isAuthenticated={isAuth}
//                 />

//                 <button
//                   onClick={toggleAutoplay}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
//                     autoplay 
//                       ? "bg-yellow-500 text-black hover:bg-yellow-400" 
//                       : "bg-gray-700 hover:bg-gray-600"
//                   }`}
//                 >
//                   {autoplay ? <FaPause /> : <FaPlay />}
//                   <span>Autoplay</span>
//                 </button>

//                 {playlistVideos.length > 0 && (
//                   <button
//                     onClick={toggleShuffle}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
//                       shuffle 
//                         ? "bg-yellow-500 text-black hover:bg-yellow-400" 
//                         : "bg-gray-700 hover:bg-gray-600"
//                     }`}
//                   >
//                     <FaRandom />
//                     <span>Shuffle</span>
//                   </button>
//                 )}

//                 <ShareButton 
//                   videoId={video._id} 
//                   className="bg-blue-600 hover:bg-blue-500"
//                 />
//               </div>

//               {/* Comments Section */}
//               <div className="mt-8">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-xl font-semibold">
//                     Comments ({video.commentCount || 0})
//                   </h3>
//                   <button
//                     onClick={() => setShowComments(!showComments)}
//                     className="text-yellow-500 hover:text-yellow-400 transition"
//                   >
//                     {showComments ? "Hide Comments" : "Show Comments"}
//                   </button>
//                 </div>

//                 {showComments && (
//                   <div className="bg-gray-800/50 rounded-lg p-4">
//                     <CommentSection 
//                       videoId={video._id} 
//                       currentUser={currentUser}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Playlist Sidebar (30% width on lg+) */}
//           <div 
//             ref={sidebarRef}
//             className={`w-full lg:w-[30%] ${isSidebarSticky ? 'lg:sticky lg:top-4' : ''}`}
//           >
//             <div className={`bg-gray-800/50 rounded-xl p-4 ${isSidebarSticky ? 'lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto' : ''}`}>
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold">Up Next</h3>
//                 <span className="text-sm text-gray-400">
//                   {playlistVideos.length} videos
//                 </span>
//               </div>
              
//               <div className="space-y-3">
//                 {(shuffle ? [...playlistVideos].sort(() => 0.5 - Math.random()) : playlistVideos)
//                   .filter(v => v._id !== videoId)
//                   .slice(0, 10) // Limit to 10 videos
//                   .map((v) => (
//                     <div
//                       key={v._id}
//                       onClick={() => navigate(`/video/${v._id}`)}
//                       className="flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700/50 transition group"
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
//                         <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs rounded">
//                          {v.duration ? v.duration : "0:00"}
//                         </div>
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="font-medium text-sm line-clamp-2 group-hover:text-yellow-400 transition">
//                           {v.title}
//                         </h4>
//                         <p className="text-xs text-gray-400 mt-1 hover:text-yellow-400 transition">
//                           {v.creatorName || "Unknown Creator"}
//                         </p>
//                         <div className="flex gap-2 text-xs text-gray-400 mt-1">
//                           <span>{v.views?.toLocaleString()} views</span>
//                           <span>•</span>
//                           <span>
//                             {new Date(v.createdAt).toLocaleDateString('en-US', {
//                               month: 'short',
//                               day: 'numeric'
//                             })}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
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
  FaEllipsisV,
  FaThumbsUp,
  FaThumbsDown,
  FaShare
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

const VideoDetailPage = () => {
  const { id: videoId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const sidebarRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
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
  const [subscribers, setSubscribers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const token = localStorage.getItem("accessToken");
  const isAuth = !!token;
  const isGuest = !currentUser;
  const isOwner = video?.isOwner ?? (currentUser?._id === video?.owner?._id);

  useEffect(() => {
    fetchData();
  }, [videoId]);

  useEffect(() => {
    if (video) {
      setEditTitle(video.title);
      setEditDesc(video.description);
    }
  }, [video]);

  useEffect(() => {
    localStorage.setItem("autoplay", JSON.stringify(autoplay));
    localStorage.setItem("shuffle", JSON.stringify(shuffle));
  }, [autoplay, shuffle]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const videoRes = await API.get(`/user/playlist/videos/${videoId}`);

      if (videoRes?.data?.success) {
        setVideo(videoRes.data.data.video);
        setPlaylistVideos(videoRes.data.data.playlistVideos);
      } else {
        toast.error("Video not found");
      }

      if (token) {
        const userRes = await API.get("/users/me");
        setCurrentUser(userRes.data.user); 
        setWatchLater(userRes.data?.user?.watchLater?.includes(videoId) || false);
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

  useEffect(() => {
    if (video?.channelId) {
      fetchSubscribers(video.channelId);
    }
  }, [video]);

  const fetchSubscribers = async (channelId) => {
    try {
      const res = await API.get(`/users/subscribe/channel/${channelId}`);
      setSubscribers(res.data.data);
    } catch (err) {
      toast.error("Error fetching subscribers");
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

  const handleEdit = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const updateVideo = async (e) => {
    e.preventDefault();
    if (editTitle === video.title && editDesc === video.description) {
      toast.info("No changes detected");
      return;
    }
    setIsUpdating(true);
    try {
      await API.put(`/user/playlist/videos/${videoId}`, {
        title: editTitle,
        description: editDesc,
      });
      toast.success("Video updated successfully");
      fetchData();
      setShowEditModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const deleteVideo = async () => {
    setIsDeleting(true);
    try {
      await API.delete(`/user/playlist/videos/${videoId}`);
      toast.success("Video deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };

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
              
              {/* Channel Info */}
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
                    channelId={video?.channelId}
                    isSubscribedInitially={video?.isSubscribed}
                    isNotifiedInitially={video?.notificationEnabled}
                    subscriberCount={video?.subscriberCount || 0}
                    isOwnChannel={isOwner}
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
                        {isAuth && (
                          <button
                            onClick={toggleWatchLater}
                            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-700"
                          >
                            <FaClock className="text-yellow-500" />
                            {watchLater ? "Remove from Watch Later" : "Save to Watch Later"}
                          </button>
                        )}
                        {isOwner && (
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
                  isAuthenticated={isAuth}
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
                      currentUser={currentUser}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playlist Sidebar */}
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
                  .slice(0, 10)
                  .map((v) => (
                    <div
                      key={v._id}
                      onClick={() => navigate(`/video/${v._id}`)}
                      className="flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700/50 transition group"
                    >
                      <div className="relative flex-shrink-0 w-40 h-24 rounded-md overflow-hidden">
                        <img
                          src={v.thumbnailUrl || `https://img.youtube.com/vi/${v.videoUrl.split('v=')[1]}/hqdefault.jpg`}
                          alt={v.title}
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div 
            className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Edit Video
                </h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-200 transition"
                >
                  <IoClose size={24} />
                </button>
              </div>
              
              <form onSubmit={updateVideo} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Title</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:bg-blue-400 transition flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div 
            className="bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Delete Video
                </h2>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-200 transition"
                >
                  <IoClose size={24} />
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                This action cannot be undone. Are you sure you want to delete this video?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteVideo}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:bg-red-400 transition flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetailPage;