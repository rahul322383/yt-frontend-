
// /* eslint-disable no-unused-vars */
// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import API from "../../../utils/axiosInstance";
// import { useAuth } from "../../../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// const SubscriptionButton = ({
//   channelId,
//   isSubscribedInitially = false,
//   subscriberCount = 0,
//   isNotifiedInitially = false,
//   isOwnChannel = false,
// }) => {
//   const navigate = useNavigate();
//   const { auth } = useAuth();
//   const isLoggedIn = auth.isAuthenticated;

//   const [isSubscribed, setIsSubscribed] = useState(isSubscribedInitially);
//   const [isNotified, setIsNotified] = useState(isNotifiedInitially);
//   const [displayCount, setDisplayCount] = useState(subscriberCount);
//   const [isLoading, setIsLoading] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [showTooltip, setShowTooltip] = useState(false);

//   // ✅ Fetch subscription status + subscriber count
//   const fetchSubscriptionData = async () => {
//     try {
//       // Get subscriber count
//       const countRes = await API.get(`/users/subscribe/channel/${channelId}`);
//       const count = countRes.data?.data?.total || 0;
//       setDisplayCount(count);

//       // Check if current logged in user is subscribed
//       if (isLoggedIn) {
//         try {
//           const statusRes = await API.get(`/users/subscribe/status/${channelId}`);
//           setIsSubscribed(statusRes.data?.data?.isSubscribed || false);
//           setIsNotified(statusRes.data?.data?.notifications || false);
//         } catch (error) {
//           // If status check fails, user is not subscribed
//           if (error.response?.status === 404) {
//             setIsSubscribed(false);
//             setIsNotified(false);
//           }
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching subscription data:", err);
//     }
//   };

//   useEffect(() => {
//     setIsSubscribed(isSubscribedInitially);
//     setIsNotified(isNotifiedInitially);
//     setDisplayCount(subscriberCount);

//     if (channelId) {
//       fetchSubscriptionData();
//     }
//   }, [isSubscribedInitially, isNotifiedInitially, subscriberCount, channelId, isLoggedIn]);

//   // ✅ Toggle Subscribe
//   const handleToggleSubscribe = async () => {
//     if (!isLoggedIn) {
//       navigate("/login");
//       return;
//     }

//     if (!channelId || isLoading) return;

//     setIsLoading(true);
//     try {
//       if (isSubscribed) {
//         // Unsubscribe
//         const res = await API.delete(`/users/subscribe/${channelId}`);
//         if (res.data.success) {
//           setIsSubscribed(false);
//           setIsNotified(false);
//           setToastMessage("❌ Unsubscribed");
//           setDisplayCount(prev => Math.max(0, prev - 1));
//         }
//       } else {
//         // Subscribe
//         const res = await API.post(`/users/subscribe/${channelId}`);
//         const { success, data } = res.data;

//         if (success) {
//           setIsSubscribed(true);
//           setIsNotified(data?.notifications || false);
//           setToastMessage("✅ Subscribed");
//           setDisplayCount(prev => prev + 1);
//         }
//       }
//     } catch (err) {
//       console.error("Subscription error:", err);
//       if (err.response?.status === 400 && err.response?.data?.message === "Already subscribed") {
//         setIsSubscribed(true);
//         setToastMessage("✅ Already subscribed");
//       } else {
//         setToastMessage("⚠️ Something went wrong");
//       }
//     } finally {
//       setIsLoading(false);
//       setTimeout(() => setToastMessage(""), 3000);
//       setShowDropdown(false);
//     }
//   };

//   // ✅ Toggle Bell Notifications
//   const handleBellToggle = async (newNotify) => {
//     if (!isSubscribed) return;

//     setIsLoading(true);
//     try {
//       const res = await API.post(`/users/subscribe/notify-toggle/${channelId}`, {
//         notifications: newNotify,
//       });

//       if (res.data.success) {
//         setIsNotified(newNotify);
//         setToastMessage(newNotify ? "🔔 Notifications ON" : "🔕 Notifications OFF");
//       } else {
//         setToastMessage("⚠️ Could not update notifications");
//       }
//     } catch (err) {
//       console.warn("Bell toggle failed:", err);
//       setToastMessage("⚠️ Could not update notifications");
//     } finally {
//       setIsLoading(false);
//       setTimeout(() => setToastMessage(""), 2500);
//       setShowDropdown(false);
//     }
//   };

//   // ✅ Format Subscriber count (K/M style)
//   const formatSubs = (count) => {
//     if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
//     if (count >= 1000) return (count / 1000).toFixed(1) + "K";
//     return count.toString();
//   };

//   return (
//     <div className="relative flex items-center gap-3">
//       <span className="text-sm text-gray-600 dark:text-gray-300">
//         {formatSubs(displayCount)} subscribers
//       </span>

//       <div className="relative flex items-center">
//         {/* Main Subscribe/Subscribed Button */}
// <div className="relative">
//   <button
//     onClick={() => {
//       if (!isLoggedIn) {
//         setShowTooltip(true);
//         return;
//       }
//       if (isSubscribed) {
//         setShowDropdown(!showDropdown); // open unsubscribe / bell dropdown
//       } else {
//         handleToggleSubscribe(); // call API to subscribe
//       }
//     }}
//     disabled={isLoading}
//     className={`relative px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-1
//       ${
//         isSubscribed
//           ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
//           : "bg-red-600 text-white hover:bg-red-700"
//       }
//       ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
//     `}
//     onMouseEnter={() => !isLoggedIn && setShowTooltip(true)}
//     onMouseLeave={() => setShowTooltip(false)}
//   >
//     {isLoading ? (
//       <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
//         <circle
//           className="opacity-25"
//           cx="12"
//           cy="12"
//           r="10"
//           stroke="currentColor"
//           strokeWidth="4"
//         />
//         <path
//           className="opacity-75"
//           fill="currentColor"
//           d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//         />
//       </svg>
//     ) : isSubscribed ? (
//       <>
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           className="h-4 w-4"
//           viewBox="0 0 20 20"
//           fill="currentColor"
//         >
//           <path
//             fillRule="evenodd"
//             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//             clipRule="evenodd"
//           />
//         </svg>
//         Subscribed
//       </>
//     ) : (
//       "Subscribe"
//     )}
//   </button>

//   {/* Tooltip for non-logged in users */}
//   {!isLoggedIn && showTooltip && (
//     <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
//       Sign in to subscribe
//       <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
//     </div>
//   )}
// </div>


//         {/* Dropdown toggle button (only shown when subscribed and logged in) */}
//         {isSubscribed && isLoggedIn && (
//           <button
//             onClick={() => setShowDropdown(!showDropdown)}
//             disabled={isLoading}
//             className={`px-2 py-1.5 rounded-r-full font-medium text-sm transition-all duration-200
//               bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600
//               ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
//               border-l border-gray-300 dark:border-gray-600
//             `}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-4 w-4"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </button>
//         )}

//         {/* Dropdown menu (similar to YouTube) */}
//         {isSubscribed && showDropdown && isLoggedIn && (
//           <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
//             <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//               <div className="text-sm font-medium text-gray-900 dark:text-white">Notifications</div>
//             </div>
//             <div className="py-1">
//               <button
//                 onClick={() => handleBellToggle(true)}
//                 className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3
//                   ${isNotified ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}
//                   hover:bg-gray-100 dark:hover:bg-gray-700
//                 `}
//               >
//                 <span className="w-6 text-center">🔔</span>
//                 All
//               </button>
//               <button
//                 onClick={() => handleBellToggle(false)}
//                 className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3
//                   ${!isNotified ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}
//                   hover:bg-gray-100 dark:hover:bg-gray-700
//                 `}
//               >
//                 <span className="w-6 text-center">🎯</span>
//                 Personalized
//               </button>
//               <button
//                 onClick={() => handleBellToggle(false)}
//                 className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//               >
//                 <span className="w-6 text-center">🚫</span>
//                 None
//               </button>
//             </div>
//             <div className="py-1 border-t border-gray-200 dark:border-gray-700">
//               <button
//                 onClick={handleToggleSubscribe}
//                 className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
//               >
//                 <span className="w-6 text-center">❌</span>
//                 Unsubscribe
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Toast Message */}
//       <AnimatePresence>
//         {toastMessage && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             transition={{ duration: 0.3 }}
//             className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-md z-50 text-sm flex items-center gap-2"
//           >
//             {toastMessage}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Click outside to close dropdown */}
//       {showDropdown && (
//         <div
//           className="fixed inset-0 z-0"
//           onClick={() => setShowDropdown(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default SubscriptionButton;

/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../utils/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SubscriptionButton = ({
  channelId,
  isSubscribedInitially = false,
  subscriberCount = 0,
  isNotifiedInitially = false,
  isOwnChannel = false,
}) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isLoggedIn = auth.isAuthenticated;

  const [isSubscribed, setIsSubscribed] = useState(isSubscribedInitially);
  const [isNotified, setIsNotified] = useState(isNotifiedInitially);
  const [displayCount, setDisplayCount] = useState(subscriberCount);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // ✅ Fetch subscription data
  const fetchSubscriptionData = async () => {
    try {
      // get count
      const countRes = await API.get(`/users/subscribe/channel/${channelId}`);
      const count = countRes.data?.data?.total || 0;
      setDisplayCount(count);

      if (isLoggedIn) {
        try {
          const statusRes = await API.get(`/users/subscribe/status/${channelId}`);
          setIsSubscribed(statusRes.data?.data?.isSubscribed || false);
          setIsNotified(statusRes.data?.data?.notifications || false);
        } catch (error) {
          if (error.response?.status === 404) {
            setIsSubscribed(false);
            setIsNotified(false);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching subscription data:", err);
    }
  };

  useEffect(() => {
    setIsSubscribed(isSubscribedInitially);
    setIsNotified(isNotifiedInitially);
    setDisplayCount(subscriberCount);

    if (channelId) {
      fetchSubscriptionData();
    }
  }, [isSubscribedInitially, isNotifiedInitially, subscriberCount, channelId, isLoggedIn]);

  // ✅ Subscribe / Unsubscribe
  const handleToggleSubscribe = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!channelId || isLoading) return;

    setIsLoading(true);
    try {
      if (isSubscribed) {
        const res = await API.delete(`/users/subscribe/${channelId}`);
        if (res.data.success) {
          setIsSubscribed(false);
          setIsNotified(false);
          setToastMessage("❌ Unsubscribed");
          setDisplayCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        const res = await API.post(`/users/subscribe/${channelId}`);
        const { success, data } = res.data;

        if (success) {
          setIsSubscribed(true);
          setIsNotified(data?.notifications || false);
          setToastMessage("✅ Subscribed");
          setDisplayCount((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error("Subscription error:", err);
      if (err.response?.status === 400 && err.response?.data?.message === "Already subscribed") {
        setIsSubscribed(true);
        setToastMessage("✅ Already subscribed");
      } else {
        setToastMessage("⚠️ Something went wrong");
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(""), 3000);
      setShowDropdown(false);
    }
  };

  // ✅ Toggle Bell
  const handleBellToggle = async (newNotify) => {
    if (!isSubscribed) return;

    setIsLoading(true);
    try {
      const res = await API.post(`/users/subscribe/notify-toggle/${channelId}`, {
        notifications: newNotify,
      });

      if (res.data.success) {
        setIsNotified(newNotify);
        setToastMessage(newNotify ? "🔔 Notifications ON" : "🔕 Notifications OFF");
      } else {
        setToastMessage("⚠️ Could not update notifications");
      }
    } catch (err) {
      console.warn("Bell toggle failed:", err);
      setToastMessage("⚠️ Could not update notifications");
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(""), 2500);
      setShowDropdown(false);
    }
  };

  const formatSubs = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  return (
    <div className="relative flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {formatSubs(displayCount)} subscribers
      </span>

      <div className="relative flex items-center">
        {/* Subscribe / Subscribed Button */}
        <div className="relative">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                navigate("/login");
                return;
              }
              if (isSubscribed) {
                setShowDropdown(!showDropdown);
              } else {
                handleToggleSubscribe();
              }
            }}
            disabled={isLoading}
            className={`relative px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-1
              ${
                isSubscribed
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  : "bg-red-600 text-white hover:bg-red-700"
              }
              ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
            `}
            onMouseEnter={() => !isLoggedIn && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : isSubscribed ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Subscribed
              </>
            ) : (
              "Subscribe"
            )}
          </button>

          {/* Tooltip for non-logged in users */}
          {!isLoggedIn && showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Sign in to subscribe
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
            </div>
          )}
        </div>

        {/* Dropdown button (only when subscribed) */}
        {isSubscribed && isLoggedIn && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isLoading}
            className={`px-2 py-1.5 rounded-r-full font-medium text-sm transition-all duration-200
              bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600
              ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
              border-l border-gray-300 dark:border-gray-600
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Dropdown Menu */}
        {isSubscribed && showDropdown && isLoggedIn && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Notifications</div>
            </div>
            <div className="py-1">
              <button
                onClick={() => handleBellToggle(true)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3
                  ${isNotified ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}
                  hover:bg-gray-100 dark:hover:bg-gray-700
                `}
              >
                <span className="w-6 text-center">🔔</span>
                All
              </button>
              <button
                onClick={() => handleBellToggle(false)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3
                  ${!isNotified ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}
                  hover:bg-gray-100 dark:hover:bg-gray-700
                `}
              >
                <span className="w-6 text-center">🎯</span>
                Personalized
              </button>
              <button
                onClick={() => handleBellToggle(false)}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="w-6 text-center">🚫</span>
                None
              </button>
            </div>
            <div className="py-1 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleToggleSubscribe}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
              >
                <span className="w-6 text-center">❌</span>
                Unsubscribe
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-md z-50 text-sm flex items-center gap-2"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
};

export default SubscriptionButton;
