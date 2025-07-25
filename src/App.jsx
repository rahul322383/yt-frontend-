/* eslint-disable no-unused-vars */
// import { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
// import axios from "axios";

// // Pages
// import HomePage from "./app/home/Home.jsx";
// import LoginPage from "./app/login/login.jsx";
// import SignUpPage from "./app/signup/signup.jsx";
// import Dashboard from "./app/dashboard/dashboard.jsx";
// import ProfilePage from "./app/Profile/ProfilePage.jsx";
// import SettingsPage from "./app/setting/settingpage.jsx";
// import { SettingsTabs } from "./app/components/SettingsTabs/SettingsTabs.jsx";
// import HistoryPage from "./app/History/History.jsx";
// import CreatePlaylistPage from "./app/playlist/CreatePlaylistPage.jsx";
// import PlaylistDetailsPage from "./app/playlist/PlaylistDetailsPage.jsx";
// import PlaylistVideomanager from "./app/playlist/PlaylistVideoManager.jsx";
// import AnalyticsPlaylistsViewsPage from "./app/playlist/AnalyticsPlaylistsViewsPage.jsx";
// import ForgotPasswordPage from "./app/profile/ForgetPasswordPage.jsx";
// import ResetPasswordPage from "./app/Profile/ResetPasswordPage.jsx";
// import LikedVideosPage from "./app/components/VideoCard/LikedVideosPage.jsx";
// import SubscribedChannelsList from "./app/components/Subscribe/SubscribedChannelsList.jsx";
// import VerifyOtp from "./app/Profile/VerifyOtp.jsx";
// import CommentSection from "./app/components/VideoCard/CommentSection.jsx";
// import VideoDetailsPage from "./app/components/VideoCard/VideoDetailsPage.jsx";
// import Channel from "./app/home/channel.jsx";
// import Subscriptions from "./app/home/Subscription.jsx";
// import AnalyticsSection from "./app/playlist/AnalyticsSection.jsx";
// import WatchLaterPage from "./app/components/user/watchlaterpage.jsx";
// import PlaylistAnalyticsPage from "./app/playlist/PlaylistAnalyticsPage.jsx";
// import SubscribersList from "./app/components//Subscribe/SubscribeList.jsx";
// import AboutPage from "./app/home/AboutPage.jsx";
// // import Notification from "./app/sections/NotificationSetting.jsx";
// import PrivacyPolicy from "./app/home/PrivacyPolicy.jsx";
// import ContactPage from "./app/home/ContactPage.jsx";
// import AdminDashboard from "./app/dashboard/adminstats.jsx";
// import ShortsPage from "./app/home/shortvideo.jsx";
// import UploadShortsForm from "./app/components/VideoCard/uploadShortform.jsx";
// import NotificationPage from "./app/home/Notification.jsx";
// import SearchBar from "./app/home/SearchBar.jsx";
// import SettingsPageHome from "./app/home/homesettingpage.jsx";
// import { AuthContext } from "./context/AuthContext.jsx";

// // Components
// import LoadingSpinner from "./app/components/common/loadingSpinner.jsx";


// // Styles
// import "./index.css";
// import Video from "./app/components/user/Video.jsx";


// // 🔄 Scroll To Top on route change
// const ScrollToTop = () => {
//   const { pathname } = useLocation();
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname]);

//   return null;
// };

// // 🔐 Protected Route Wrapper
// const ProtectedRoute = ({ children, user }) => {
//   return user ? children : <Navigate to="/login" replace />;
// };

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeSection, setActiveSection] = useState("account");

//   // Fetch current user using a custom hook or in useEffect
//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const res = await axios.get("/users/me", { withCredentials: true });
//         setUser(res.data.user || null);
//       } catch (err) {
//         console.error("Error fetching current user", err);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCurrentUser();
//   }, []);

// // const [themeMode, setThemeMode] = useState("light")

//   // const lightTheme = () => {
//   //   setThemeMode("light")
//   // }

//   // const darkTheme = () => {
//   //   setThemeMode("dark")
//   // }

//   // // actual change in theme

//   // useEffect(() => {
//   //   document.querySelector('html').classList.remove("light", "dark")
//   //   document.querySelector('html').classList.add(themeMode)
//   // }, [themeMode])

//   if (loading) return <LoadingSpinner />;

//   return (

//       // <ThemeProvider value={{ themeMode, lightTheme, darkTheme }} >
//     <Router>
//       <ScrollToTop />
//       <Routes>
//         {/* 🌐 Public routes */}
//         <Route path="/" element={<HomePage />} />
//         <Route
//           path="/login"
//           element={user ? <Navigate to="/dashboard" replace /> : <LoginPage setUser={setUser} />}
//         />
//         <Route
//           path="/signup"
//           element={user ? <Navigate to="/dashboard" replace /> : <SignUpPage setUser={setUser} />}
//         />
//         {/* <Route path="/notifications" element={<Notification />} /> */}
//         <Route path="/about" element={<AboutPage />} />
//         <Route path="/privacy-policy" element={<PrivacyPolicy />} />
//         <Route path="/contact" element={<ContactPage />} />
//        <Route path="/shorts" element={<ShortsPage />} />
//        <Route path="/notifications" element={<NotificationPage />} />
//         <Route path="/search" element={<SearchBar />} />
//         <Route path="/search/:query" element={<SearchBar />} />


//         <Route path="/forget-password" element={<ForgotPasswordPage />} />
//         <Route path="/reset-password" element={<ResetPasswordPage />} />
//         <Route path="/verify-otp" element={<VerifyOtp />} />
//         <Route path="/subscribed-channels" element={<SubscribedChannelsList />} />
//         <Route path="/subscribers/channel/:channelId" element={<SubscribersList />} />
//         <Route path="/videos" element={<Video />} />

//         {/* <Route path="/video/:id" element={<Video />} /> */}
//         <Route path="/video" element={<Navigate to="/videos" replace />} />
//         <Route path="/video/:id/watch" element={<Video />} />
//         <Route path="/channel/:channelId" element={<Channel />} />
//         <Route
//           path="/uploads"
//           element={
//             <ProtectedRoute user={user}>
//               <UploadShortsForm />
//             </ProtectedRoute>
//           } 
//         />
//         <Route
//           path="/settings"
//           element={
//             <SettingsPageHome user={user} setUser={setUser} />
//           }
//         />

//         <Route path="/watch-later" element={<WatchLaterPage />} />




//         {/* 🔐 Protected routes */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute user={user}>
//               <Dashboard user={user} setUser={setUser} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/AdminDashboard"
//           element={
//             <ProtectedRoute user={user}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
        
//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute user={user}>
//               <ProfilePage user={user} />
//             </ProtectedRoute>
//           }
//         />
        
//         <Route path="/subscriptions" element={<Subscriptions />} />
//         <Route
//           path="/settings/tabs"
//           element={
//             <ProtectedRoute user={user}>
//               <SettingsTabs activeTab={activeSection} onTabChange={setActiveSection} />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/AnalyticsSection" element={<AnalyticsSection />} />

//         {/* 🎵 Playlist Routes */}
//         <Route
//           path="/playlists"
//           element={
//             <ProtectedRoute user={user}>
//               <CreatePlaylistPage user={user} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/playlists/create"
//           element={
//             <ProtectedRoute user={user}>
//               <CreatePlaylistPage user={user} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/playlists/edit/:id"
//           element={
//             <ProtectedRoute user={user}>
//               <CreatePlaylistPage user={user} isEditMode />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/playlists/manager/:id"
//           element={
//             <ProtectedRoute user={user}>
//               <PlaylistVideomanager />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/playlists/:id"
//           element={
//             <ProtectedRoute user={user}>
//               <PlaylistDetailsPage user={user} />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/playlist" element={<Navigate to="/playlists" replace />} />

//         <Route path="/video/:id" element={<VideoDetailsPage />} />

//         {/* 🎥 Video Routes */}
//         <Route path="/comments/:videoId" element={<CommentSection />} />

//         {/* 🕓 History */}
//         <Route
//           path="/history"
//           element={
          
//               <HistoryPage user={user} />
          
//           }
//         />

//         {/* ❤️ Liked */}
//         <Route
//           path="/liked-videos"
//           element={
//             <LikedVideosPage user={user} />
//           }
//         />

//         {/* 📊 Analytics */}
//         <Route
//           path="/views"
//           element={
//             <ProtectedRoute user={user}>
//               <AnalyticsPlaylistsViewsPage user={user} />
//             </ProtectedRoute>
//           }
//         />
//       <Route path="/analytics" element={<PlaylistAnalyticsPage />} />

//         {/* 🚫 404 Fallback */}
//         <Route
//           path="*"
//           element={
//             <div className="p-10 text-center text-xl text-red-600 font-semibold">
//               404 - Page Not Found
//             </div>
//           }
//         />
//       </Routes>
//     </Router>
//     // </ThemeProvider>
    
//   );
// };

// export default App;


import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext.jsx"; // ✅ Import here

// Pages & Components
import HomePage from "./app/home/Home.jsx";
import LoginPage from "./app/login/login.jsx";
import SignUpPage from "./app/signup/signup.jsx";
import Dashboard from "./app/dashboard/dashboard.jsx";
import ProfilePage from "./app/Profile/ProfilePage.jsx";
import SettingsPageHome from "./app/home/homesettingpage.jsx";
import HistoryPage from "./app/History/History.jsx";
import CreatePlaylistPage from "./app/playlist/CreatePlaylistPage.jsx";
import PlaylistDetailsPage from "./app/playlist/PlaylistDetailsPage.jsx";
import PlaylistVideomanager from "./app/playlist/PlaylistVideoManager.jsx";
import AnalyticsPlaylistsViewsPage from "./app/playlist/AnalyticsPlaylistsViewsPage.jsx";
import ForgotPasswordPage from "./app/profile/ForgetPasswordPage.jsx";
import ResetPasswordPage from "./app/Profile/ResetPasswordPage.jsx";
import LikedVideosPage from "./app/components/VideoCard/LikedVideosPage.jsx";
import SubscribedChannelsList from "./app/components/Subscribe/SubscribedChannelsList.jsx";
import VerifyOtp from "./app/Profile/VerifyOtp.jsx";
import CommentSection from "./app/components/VideoCard/CommentSection.jsx";
import VideoDetailsPage from "./app/components/VideoCard/VideoDetailsPage.jsx";
import Channel from "./app/home/channel.jsx";
import Subscriptions from "./app/home/Subscription.jsx";
import AnalyticsSection from "./app/playlist/AnalyticsSection.jsx";
import WatchLaterPage from "./app/components/user/watchlaterpage.jsx";
import PlaylistAnalyticsPage from "./app/playlist/PlaylistAnalyticsPage.jsx";
import SubscribersList from "./app/components//Subscribe/SubscribeList.jsx";
import AboutPage from "./app/home/AboutPage.jsx";
import PrivacyPolicy from "./app/home/PrivacyPolicy.jsx";
import ContactPage from "./app/home/ContactPage.jsx";
import AdminDashboard from "./app/dashboard/adminstats.jsx";
import ShortsPage from "./app/home/shortvideo.jsx";
import UploadShortsForm from "./app/components/VideoCard/uploadShortform.jsx";
import NotificationPage from "./app/home/Notification.jsx";
import SearchBar from "./app/home/SearchBar.jsx";
import { SettingsTabs } from "./app/components/SettingsTabs/SettingsTabs.jsx";
import LoadingSpinner from "./app/components/common/loadingSpinner.jsx";
import Video from "./app/components/user/Video.jsx";

import "./index.css";

// 🔄 Scroll to top
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// 🔐 Auth Protected Route
const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  if (auth.loading) return <LoadingSpinner />;
  return auth.isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { auth } = useAuth();

  return (
    <Routes>
      {/* 🌐 Public Routes */}
      <Route path="/trending" element={<HomePage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={  <LoginPage />} />
      <Route path="/signup" element={auth.isAuthenticated ? <Navigate to="/dashboard" /> : <SignUpPage />} />
      <Route path="/forget-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/shorts" element={<ShortsPage />} />
      <Route path="/notifications" element={<NotificationPage />} />
      <Route path="/search" element={<SearchBar />} />
      <Route path="/search" element={<SearchBar />} />
      <Route path="/subscribed-channels" element={<SubscribedChannelsList />} />
      <Route path="/subscribers/channel/:channelId" element={<SubscribersList />} />
      <Route path="/videos" element={<Video />} />
      <Route path="/video" element={<Navigate to="/videos" replace />} />
      <Route path="/video/:id/watch" element={<Video />} />
      <Route path="/channel/:channelId" element={<Channel />} />
      <Route path="/watch-later" element={<WatchLaterPage />} />
      <Route path="/video/:id" element={<VideoDetailsPage />} />
      <Route path="/comments/:videoId" element={<CommentSection />} />

      {/* 🔐 Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/AdminDashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/settings/tabs" element={<ProtectedRoute><SettingsTabs /></ProtectedRoute>} />
      <Route path="/settings" element={<SettingsPageHome />} />
      <Route path="/AnalyticsSection" element={<AnalyticsSection />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/liked-videos" element={<LikedVideosPage />} />
      <Route path="/views" element={<ProtectedRoute><AnalyticsPlaylistsViewsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<PlaylistAnalyticsPage />} />
      <Route path="/uploads" element={<ProtectedRoute><UploadShortsForm /></ProtectedRoute>} />

      {/* 🎵 Playlist Routes */}
      <Route path="/playlists" element={<ProtectedRoute><CreatePlaylistPage /></ProtectedRoute>} />
      <Route path="/playlists/create" element={<ProtectedRoute><CreatePlaylistPage /></ProtectedRoute>} />
      <Route path="/playlists/edit/:id" element={<ProtectedRoute><CreatePlaylistPage isEditMode /></ProtectedRoute>} />
      <Route path="/playlists/manager/:id" element={<ProtectedRoute><PlaylistVideomanager /></ProtectedRoute>} />
      <Route path="/playlists/:id" element={<ProtectedRoute><PlaylistDetailsPage /></ProtectedRoute>} />
      <Route path="/playlist" element={<Navigate to="/playlists" replace />} />

      {/* 404 */}
      <Route path="*" element={<div className="p-10 text-center text-xl text-red-600 font-semibold">404 - Page Not Found</div>} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
