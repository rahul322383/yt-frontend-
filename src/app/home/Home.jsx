/* eslint-disable no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import { FaBars, FaBell, FaSearch, FaPlus, FaMoon, FaSun } from "react-icons/fa";
// import Cookies from "js-cookie";
// import API from "../../utils/axiosInstance.jsx";
// import ReactPlayer from "react-player";
// import "../../index.css";

// // Skeleton loader while videos are fetching
// const SkeletonCard = () => (
//   <div className="animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700 h-72 w-full" />
// );

// // Video Card Component
// const VideoCard = ({ video }) => {
//   const id = video.videoId || video._id;
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div
//       className="block cursor-pointer"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={() => (window.location.href = `/video/${id}`)}
//     >
//       <div className="bg-blue-250 dark:bg-gray-800  hover:shadow-lg transition-all overflow-hidden cursor-pointer rounded-lg shadow-sm">
//         <div className="relative w-full pt-[56.25%] cursor-pointer">
//           <ReactPlayer
//             url={video.videoUrl}
//             controls={isHovered}
//             playing={isHovered}
//             width="100%"
//             height="100%"
//             className="absolute top-0 left-0 cursor-pointer"
//             muted
//             playsinline
//           />
//         </div>
//         <div className="p-4 space-y-1">
//           <h3 className="text-md font-semibold truncate text-gray-900 dark:text-white">
//             {video.title || "Untitled Video"}
//           </h3>
//           <p className="text-sm text-gray-600 dark:text-gray-400">
//             {/* Use span instead of Link to avoid nesting <a> */}
//             <span
//               onClick={(e) => {
//                 e.stopPropagation();
//                 window.location.href = `/channel/${video.channelId}`;
//               }}
//               className="text-blue-600 hover:underline cursor-pointer"
//             >
//               {video.creatorName || "Unknown"}
//             </span>
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-400">
//             {video.views} views · {video.likeCount || 0} likes · {video.dislikeCount || 0} dislikes
//             {/* · {video.commentCount || 0} comments */}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };


// // Main Home Page
// const HomePage = ({ initialView = "trending" }) => {
//   const [user, setUser] = useState({});
//   const [videos, setVideos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [view, setView] = useState(() => Cookies.get("view") || initialView);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isSidebarOpen, setSidebarOpen] = useState(true);
//   const [notificationCount] = useState(3);
//   const [showProfileDropdown, setShowProfileDropdown] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   const toggleSidebar = () => setSidebarOpen((prev) => !prev);
//   const toggleProfileDropdown = () => setShowProfileDropdown((prev) => !prev);

//   const toggleDarkMode = () => {
//     const html = document.documentElement;
//     html.classList.toggle("dark");
//     const dark = html.classList.contains("dark");
//     setIsDarkMode(dark);
//     localStorage.setItem("theme", dark ? "dark" : "light");
//   };

//   useEffect(() => {
//     const storedTheme = localStorage.getItem("theme");
//     const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//     const isDark = storedTheme === "dark" || (!storedTheme && prefersDark);
//     document.documentElement.classList.toggle("dark", isDark);
//     setIsDarkMode(isDark);
//   }, []);

//   useEffect(() => {
//     const urlParams = new URLSearchParams(location.search);
//     const query = urlParams.get("q") || "";
//     setSearchQuery(query);
//   }, [location.search]);

//   useEffect(() => {
//     Cookies.set("view", view, { expires: 7 });

//     const fetchVideos = async () => {
//       setLoading(true);
//       try {
//         const endpoint = view === "trending" ? "/videos/trending" : "/users/videos";
//         const res = await API.get(endpoint);
//         if (res?.data?.success && Array.isArray(res.data.data)) {
//           setVideos(res.data.data);
//         } else {
//           throw new Error("Invalid response format.");
//         }
//       } catch (err) {
//         console.error("Fetch error:", err);
//         toast.error("Failed to fetch videos.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVideos();
//   }, [view]);

//   useEffect(() => {
//     if (videos.length === 0) return;

//     const fetchLikeDislikeCounts = async () => {
//       try {
//         const likePromises = videos.map(async (video) => {
//           const res = await API.get(`/user/videos/${video._id}/like-count`);
//           if (res?.data?.success) {
//             const { likeCount, dislikeCount } = res.data.data;
//             return {
//               videoId: video._id,
//               likeCount: likeCount || 0,
//               dislikeCount: dislikeCount || 0,
//             };
//           }
//           return { videoId: video._id, likeCount: 0, dislikeCount: 0 };
//         });

//         const results = await Promise.all(likePromises);

//         const mapById = {};
//         results.forEach(({ videoId, likeCount, dislikeCount }) => {
//           mapById[videoId] = { likeCount, dislikeCount };
//         });

//         setVideos((prevVideos) =>
//           prevVideos.map((video) => ({
//             ...video,
//             likeCount: mapById[video._id]?.likeCount || video.likeCount || 0,
//             dislikeCount: mapById[video._id]?.dislikeCount || video.dislikeCount || 0,
//           }))
//         );
//       } catch (error) {
//         console.error("Error fetching like/dislike counts:", error);
//       }
//     };

//     fetchLikeDislikeCounts();
//   }, [videos]);

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
//   };

//   const filteredVideos = useMemo(() => {
//     const query = searchQuery.toLowerCase();
//     return videos.filter(
//       (v) =>
//         v.title?.toLowerCase().includes(query) ||
//         v.description?.toLowerCase().includes(query) ||
//         v.creatorName?.toLowerCase().includes(query)
//     );
//   }, [searchQuery, videos]);

//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
//       {/* Header */}
//       <header className="flex justify-between items-center bg-white dark:bg-gray-800 shadow px-4 py-2">
//         <div className="flex items-center gap-4">
//           <FaBars
//             className="text-2xl cursor-pointer text-gray-700 dark:text-white"
//             onClick={toggleSidebar}
//           />
//           <Link to="/" className="text-xl font-bold">MyVideoApp</Link>
//         </div>

//         <form
//           onSubmit={handleSearchSubmit}
//           className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
//         >
//           <input
//             type="text"
//             placeholder="Search..."
//             className="bg-transparent outline-none text-gray-800 dark:text-white px-2"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           <button type="submit">
//             <FaSearch className="text-gray-500 dark:text-white" />
//           </button>
//         </form>

//         <div className="flex items-center space-x-3">
//           <button
//             onClick={toggleDarkMode}
//             className="text-xl text-gray-700 dark:text-white"
//             title="Toggle Dark Mode"
//           >
//             {isDarkMode ? <FaSun /> : <FaMoon />}
//           </button>

//           <Link to="/login" className="hidden md:flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
//             Login
//           </Link>
//           <Link to="/signup" className="hidden md:flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
//             <FaPlus className="mr-2" /> Sign Up
//           </Link>
//           <Link to="/shorts" className="hidden md:flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full">
//             <FaPlus className="mr-2" /> Shorts
//           </Link>

//           <div className="relative">
//             <Link to="/notifications">
//               <FaBell className="text-2xl text-gray-700 dark:text-white" />
//               {notificationCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
//                   {notificationCount}
//                 </span>
//               )}
//             </Link>
//           </div>

//           <div className="relative">
//             <img
//               src={user.avatar || "/default-avatar.png"}
//               alt="User Avatar"
//               onClick={toggleProfileDropdown}
//               className="h-8 w-8 rounded-full object-cover cursor-pointer border"
//             />
//             {showProfileDropdown && (
//               <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-md rounded-lg z-10">
//                 {["profile", "settings", "about", "contact", "privacy-policy"].map((route) => (
//                   <Link
//                     key={route}
//                     to={`/${route}`}
//                     className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     {route.charAt(0).toUpperCase() + route.slice(1)}
//                   </Link>
//                 ))}
//                 <button
//                   onClick={() => {
//                     Cookies.remove("token");
//                     setUser({});
//                     navigate("/login");
//                   }}
//                   className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
//                 >
//                   Login
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </header>

//       {/* Main Layout */}
//       <div className="flex flex-grow min-h-[calc(100vh-5000px)] bg-gray-100 dark:bg-gray-900">
//         {isSidebarOpen && (
//           <aside className="w-50 bg-gray-100 dark:bg-gray-900 p-2 space-y-6 flex-shrink-0">
//             {[
//               "signup", "settings", "profile", "notifications","watch-later","liked-videos","history", "about", "contact", "privacy-policy", "subscribed-channels"
//             ].map((route) => (
//               <Link
//                 key={route}
//                 to={`/${route}`}
//                 className="block hover:text-gray-300 capitalize"
//               >
//                 {route}
//               </Link>
//             ))}
//           </aside>
//         )}

//         <main className="flex-grow container mx-auto px-4 py-6">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-2xl font-bold capitalize">{view} Videos</h1>
//             <div className="space-x-3">
//               {["trending", "latest"].map((v) => (
//                 <button
//                   key={v}
//                   onClick={() => setView(v)}
//                   className={`px-3 py-1 rounded ${view === v ? "bg-blue-600 text-white" : "bg-gray-300 dark:bg-gray-700"}`}
//                 >
//                   {v.charAt(0).toUpperCase() + v.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {loading ? (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
//             </div>
//           ) : filteredVideos.length === 0 ? (
//             <p>No videos found.</p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {filteredVideos.map((video) => (
//                 <VideoCard key={video._id} video={video} />
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default HomePage;

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  FaBars, 
  FaBell, 
  FaSearch, 
  FaPlus, 
  FaMoon, 
  FaSun,
  FaHome,
  FaFire,
  FaTh, 
  FaHistory,
  FaClock,
  FaThumbsUp,
  FaBookmark,
  FaChartBar,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus
} from "react-icons/fa";
import { MdSubscriptions, MdVideoLibrary } from "react-icons/md";
import Cookies from "js-cookie";
import API from "../../utils/axiosInstance.jsx";
import ReactPlayer from "react-player";
import "../../index.css";

// Skeleton loader while videos are fetching
const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700 h-72 w-full" />
);

// Video Card Component
const VideoCard = ({ video }) => {
  const id = video.videoId || video._id;
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="block cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/video/${id}`)}
    >
      <div className="bg-blue-250 dark:bg-gray-800 hover:shadow-lg transition-all overflow-hidden cursor-pointer rounded-lg shadow-sm">
        <div className="relative pb-[56.25%] cursor-pointer">
          <ReactPlayer
            url={video.videoUrl}
            controls={isHovered}
            width="100%"
            height="100%"
            className="absolute top-0 left-0 cursor-pointer"
            muted
          />
        </div>
        <div className="p-4 space-y-1">
          <h3 className="text-md font-semibold truncate text-gray-900 dark:text-white">
            {video.title || "Untitled Video"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/channel/${video.channelId}`);
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              {video.creatorName || "Unknown"}
            </span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {video.views} views · {video.likeCount || 0} likes · {video.dislikeCount || 0} dislikes
          </p>
        </div>
      </div>
    </div>
  );
};

// Sidebar Navigation Item Component
const SidebarItem = ({ to, icon: Icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
      isActive
        ? "bg-gray-200 dark:bg-gray-700 font-medium"
        : "hover:bg-gray-100 dark:hover:bg-gray-800"
    }`}
  >
    <Icon className="text-lg" />
    <span>{label}</span>
  </Link>
);

// Main Home Page Component
const HomePage = ({ initialView = "trending" }) => {
  const [auth, setAuth] = useState({
    user: null,
    isAuthenticated: false,
    loading: true
  });
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [view, setView] = useState(() => Cookies.get("view") || initialView);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCount] = useState(3);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setAuth({ user: null, isAuthenticated: false, loading: false });
          return;
        }

        const { data } = await API.get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data?.data) {
          setAuth({ user: data.data, isAuthenticated: true, loading: false });
        } else {
          localStorage.removeItem("accessToken");
          setAuth({ user: null, isAuthenticated: false, loading: false });
        }
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("accessToken");
        setAuth({ user: null, isAuthenticated: false, loading: false });
      }
    };

    checkAuth();
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleProfileDropdown = () => setShowProfileDropdown((prev) => !prev);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    const dark = html.classList.contains("dark");
    setIsDarkMode(dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = storedTheme === "dark" || (!storedTheme && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get("q") || "";
    setSearchQuery(query);
  }, [location.search]);

  useEffect(() => {
    Cookies.set("view", view, { expires: 7 });

    const fetchVideos = async () => {
      setLoadingVideos(true);
      try {
        const endpoint = view === "trending" ? "/videos/trending" : "/users/videos";
        const res = await API.get(endpoint);
        if (res?.data?.success && Array.isArray(res.data.data)) {
          setVideos(res.data.data);
        } else {
          throw new Error("Invalid response format.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to fetch videos.");
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [view]);

  useEffect(() => {
    if (videos.length === 0) return;

    const fetchLikeDislikeCounts = async () => {
      try {
        const likePromises = videos.map(async (video) => {
          const res = await API.get(`/user/videos/${video._id}/like-count`);
          if (res?.data?.success) {
            const { likeCount, dislikeCount } = res.data.data;
            return {
              videoId: video._id,
              likeCount: likeCount || 0,
              dislikeCount: dislikeCount || 0,
            };
          }
          return { videoId: video._id, likeCount: 0, dislikeCount: 0 };
        });

        const results = await Promise.all(likePromises);

        const mapById = {};
        results.forEach(({ videoId, likeCount, dislikeCount }) => {
          mapById[videoId] = { likeCount, dislikeCount };
        });

        setVideos((prevVideos) =>
          prevVideos.map((video) => ({
            ...video,
            likeCount: mapById[video._id]?.likeCount || video.likeCount || 0,
            dislikeCount: mapById[video._id]?.dislikeCount || video.dislikeCount || 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching like/dislike counts:", error);
      }
    };

    fetchLikeDislikeCounts();
  }, [videos]);

  const handleLogout = async () => {
    try {
      await API.post("/users/logout", {}, { withCredentials: true });
      setAuth({ user: null, isAuthenticated: false, loading: false });
      localStorage.removeItem("accessToken");
      navigate("/");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout Error:", err);
      toast.error("Logout failed!");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const filteredVideos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return videos.filter(
      (v) =>
        v.title?.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query) ||
        v.creatorName?.toLowerCase().includes(query)
    );
  }, [searchQuery, videos]);

  const isActive = (path) => location.pathname === path;

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center bg-white dark:bg-gray-800 shadow px-4 py-2 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <FaBars
            className="text-2xl cursor-pointer text-gray-700 dark:text-white"
            onClick={toggleSidebar}
          />
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-600">My</span>VideoApp
          </Link>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex-1 max-w-2xl mx-4"
        >
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-gray-800 dark:text-white px-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="px-2">
            <FaSearch className="text-gray-500 dark:text-white" />
          </button>
        </form>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="text-xl text-gray-700 dark:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          {auth.isAuthenticated ? (
            <>
              <div className="relative">
                <Link to="/notifications" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <FaBell className="text-xl text-gray-700 dark:text-white" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1.5 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="relative">
                <img
                  src={auth.user?.avatar || "/default-avatar.png"}
                  alt="User Avatar"
                  onClick={toggleProfileDropdown}
                  className="h-8 w-8 rounded-full object-cover cursor-pointer border border-gray-300 dark:border-gray-600"
                />
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-10 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium">{auth.user?.fullname || "User"}</p>
                      <p className="text-sm text-gray-500">{auth.user?.email || ""}</p>
                    </div>
                    {["profile", "settings"].map((route) => (
                      <Link
                        key={route}
                        to={`/${route}`}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {route.charAt(0).toUpperCase() + route.slice(1)}
                      </Link>
                    ))}
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaSignOutAlt /> Sign Out
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                to="/login" 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <FaSignInAlt /> Login
              </Link>
              <Link 
                to="/signup" 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FaUserPlus /> Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-white dark:bg-gray-800 p-4 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
            <div className="space-y-1">
              <SidebarItem to="/" icon={FaHome} label="Home" isActive={isActive("/")} />
              <SidebarItem 
                to="/trending" 
                icon={FaFire} 
                label="Trending" 
                isActive={isActive("/trending")} 
              />
              <SidebarItem 
  to="/dashboard" 
  icon={FaTh} // Changed from FaHistory to FaTh
  label="dashboard" 
  isActive={isActive("/dashboard")} 
/>
              <SidebarItem 
                to="/subscriptions" 
                icon={MdSubscriptions} 
                label="Subscriptions" 
                isActive={isActive("/subscriptions")} 
              />
             
            </div>

            {auth.isAuthenticated && (
              <>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Library
                  </h3>
                  <div className="space-y-1">
                    <SidebarItem 
                      to="/playlists" 
                      icon={FaBookmark} 
                      label="Playlists" 
                      isActive={isActive("/playlists")} 
                    />
                    <SidebarItem 
                      to="/history" 
                      icon={FaHistory} 
                      label="History" 
                      isActive={isActive("/history")} 
                    />
                    <SidebarItem 
                      to="/watch-later" 
                      icon={FaClock} 
                      label="Watch Later" 
                      isActive={isActive("/watch-later")} 
                    />
                    <SidebarItem 
                      to="/liked-videos" 
                      icon={FaThumbsUp} 
                      label="Liked Videos" 
                      isActive={isActive("/liked-videos")} 
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Your Content
                  </h3>
                  <div className="space-y-1">
                    <SidebarItem 
                      to="/videos" 
                      icon={MdVideoLibrary} 
                      label="Your Videos" 
                      isActive={isActive("/your-videos")} 
                    />
                    <SidebarItem 
                      to="/analytics" 
                      icon={FaChartBar} 
                      label="Analytics" 
                      isActive={isActive("/analytics")} 
                    />
                  </div>
                </div>
              </>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </h3>
              <div className="space-y-1">
                <SidebarItem 
                  to="/settings" 
                  icon={FaCog} 
                  label="Settings" 
                  isActive={isActive("/settings")} 
                />
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold capitalize">
              {view === "trending" ? "Trending Videos" : "Latest Videos"}
            </h1>
            <div className="flex space-x-2">
              {["trending", "latest"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    view === v
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loadingVideos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-xl font-medium mb-2">No videos found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? "Try a different search term" : "Check back later for new content"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;