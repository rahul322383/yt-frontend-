// // // YouTubeConnect.jsx
// // import { useState } from "react";
// // import API from "../../utils/axiosInstance"
// // import { toast } from "react-hot-toast";

// // export default function YouTubeConnect({ setFormData }) {
// //   const [youtubeLoading, setYoutubeLoading] = useState(false);

// //   const connectYouTube = async () => {
// //     setYoutubeLoading(true);
// //     try {
// //       const token = localStorage.getItem("accessToken");
// //       const response = await API.get("/users/connect-youtube", {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       const authUrl = response.data.data.authUrl;
// //       if (!authUrl) throw new Error("No auth URL returned");

// //       const popup = window.open(authUrl, "youtube_oauth", "width=600,height=700,top=100,left=100");
// //       if (!popup) throw new Error("Popup blocked");

// //       toast.success("Complete YouTube connection in popup");

// //       // Poll popup closed
// //       const timer = setInterval(() => {
// //         if (popup.closed) {
// //           clearInterval(timer);
// //           checkYouTubeStatus();
// //           setYoutubeLoading(false);
// //         }
// //       }, 500);

// //       // Listen for message from popup
// //       window.addEventListener("message", (event) => {
// //         if (event.data?.type === "YOUTUBE_CONNECTED") {
// //           if (event.data.success) toast.success("YouTube connected!");
// //           else toast.error(event.data.error || "Failed to connect YouTube");
// //           checkYouTubeStatus();
// //           setYoutubeLoading(false);
// //         }
// //       }, { once: true });

// //     } catch (error) {
// //       console.error("Failed to connect YouTube:", error);
// //       toast.error(error.response?.data?.message || error.message || "Failed to connect YouTube");
// //       setYoutubeLoading(false);
// //     }
// //   };

// //   const checkYouTubeStatus = async () => {
// //     try {
// //       const response = await API.get("/users/check-youtube-status");
// //       const data = response.data.data;
// //       setFormData(prev => ({
// //         ...prev,
// //         youtubeConnected: data.youtube.connected || false,
// //         youtubeChannel: data.youtube.channel || null,
// //         autoUpload: data.youtube.autoUpload || false,
// //         defaultVisibility: data.youtube.defaultVisibility || "private",
// //         uploadQuality: data.youtube.uploadQuality || "hd1080",
// //       }));
// //     } catch (error) {
// //       console.error("Failed to check YouTube status:", error);
// //     }
// //   };

// //   return (
// //     <button disabled={youtubeLoading} onClick={connectYouTube} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
// //       {youtubeLoading ? "Connecting..." : "Connect YouTube"}
// //     </button>
// //   );
// // }

// // YouTubeConnect.jsx


// // YouTubeConnect.jsx
// import { useState } from "react";
// import API from "../../utils/axiosInstance";
// import { toast } from "react-hot-toast";
// import { Loader2Icon } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";

// export default function YouTubeConnect({ setFormData, youtubeLoading, setYoutubeLoading }) {
//   const { auth, checkAuth } = useAuth(); // ✅ Use AuthContext
//   const token = auth?.user ? localStorage.getItem("accessToken") : null;

//   const connectYouTube = async () => {
//     if (!token) {
//       toast.error("You must be logged in to connect YouTube");
//       return;
//     }

//     setYoutubeLoading(true);
//     try {
//       const response = await API.get("/users/connect-youtube", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const authUrl = response.data.data.authUrl;
//       if (!authUrl) throw new Error("No auth URL returned");

//       const popup = window.open(authUrl, "youtube_oauth", "width=600,height=700,top=100,left=100");
//       if (!popup) throw new Error("Popup blocked");

//       toast.success("Complete YouTube connection in popup");

//       // Poll popup closed
//       const timer = setInterval(() => {
//         if (popup.closed) {
//           clearInterval(timer);
//           checkYouTubeStatus();
//           setYoutubeLoading(false);
//         }
//       }, 500);

//       // Listen for message from popup
//       window.addEventListener(
//         "message",
//         (event) => {
//           if (event.data?.type === "YOUTUBE_CONNECTED") {
//             if (event.data.success) toast.success("YouTube connected!");
//             else toast.error(event.data.error || "Failed to connect YouTube");

//             checkYouTubeStatus();
//             setYoutubeLoading(false);
//             // Refresh global auth state in case user info updated
//             checkAuth();
//           }
//         },
//         { once: true }
//       );
//     } catch (error) {
//       console.error("Failed to connect YouTube:", error);
//       toast.error(error.response?.data?.message || error.message || "Failed to connect YouTube");
//       setYoutubeLoading(false);
//     }
//   };

//   const checkYouTubeStatus = async () => {
//     try {
//       const response = await API.get("/users/check-youtube-status", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = response.data.data;
//       setFormData((prev) => ({
//         ...prev,
//         youtubeConnected: data.youtube.connected || false,
//         youtubeChannel: data.youtube.channel || null,
//         autoUpload: data.youtube.autoUpload || false,
//         defaultVisibility: data.youtube.defaultVisibility || "private",
//         uploadQuality: data.youtube.uploadQuality || "hd1080",
//       }));
//     } catch (error) {
//       console.error("Failed to check YouTube status:", error);
//     }
//   };

//   return (
//     <button
//       disabled={youtubeLoading || !token}
//       onClick={connectYouTube}
//       className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
//     >
//       {youtubeLoading ? (
//         <Loader2Icon className="w-5 h-5 animate-spin" />
//       ) : (
//         <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
//           <path d="M23.498 6.186a2.998 2.998 0 0 0-2.116-2.116C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.382.57a2.998 2.998 0 0 0-2.116 2.116C0 8.048 0 12 0 12s0 3.952.502 5.814a2.998 2.998 0 0 0 2.116 2.116C4.48 20.5 12 20.5 12 20.5s7.52 0 9.382-.57a2.998 2.998 0 0 0 2.116-2.116C24 15.952 24 12 24 12s0-3.952-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
//         </svg>
//       )}
//       Connect YouTube Account
//     </button>
//   );
// }

import { useState } from "react";
import API from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { Loader2Icon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function YouTubeConnect({ setFormData, youtubeLoading, setYoutubeLoading }) {
  const { auth, checkAuth } = useAuth();
  const token = auth?.user ? localStorage.getItem("accessToken") : null;

  const connectYouTube = async () => {
    if (!token) {
      toast.error("You must be logged in to connect YouTube");
      return;
    }

    setYoutubeLoading(true);
    try {
      const response = await API.get("/users/connect-youtube", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response?.data?.data;

      if (!data || !data.authUrl) {
        throw new Error("No auth URL returned from server");
      }

      const authUrl = data.authUrl;

      const popup = window.open(authUrl, "youtube_oauth", "width=600,height=700,top=100,left=100");
      if (!popup) throw new Error("Popup blocked");

      toast.success("Complete YouTube connection in popup");

      // Poll popup closed
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          checkYouTubeStatus();
          setYoutubeLoading(false);
        }
      }, 500);

      // Listen for message from popup
      window.addEventListener(
        "message",
        (event) => {
          if (event.data?.type === "YOUTUBE_CONNECTED") {
            if (event.data.success) toast.success("YouTube connected!");
            else toast.error(event.data.error || "Failed to connect YouTube");

            checkYouTubeStatus();
            setYoutubeLoading(false);
            checkAuth(); // refresh global auth state
          }
        },
        { once: true }
      );
    } catch (error) {
      console.error("Failed to connect YouTube:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to connect YouTube. Make sure you are logged in and try again."
      );
      setYoutubeLoading(false);
    }
  };

  const checkYouTubeStatus = async () => {
    if (!token) return;

    try {
      const response = await API.get("/users/check-youtube-status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response?.data?.data;

      if (!data) return;

      setFormData((prev) => ({
        ...prev,
        youtubeConnected: data.youtube?.connected || false,
        youtubeChannel: data.youtube?.channel || null,
        autoUpload: data.youtube?.autoUpload || false,
        defaultVisibility: data.youtube?.defaultVisibility || "private",
        uploadQuality: data.youtube?.uploadQuality || "hd1080",
      }));
    } catch (error) {
      console.error("Failed to check YouTube status:", error);
    }
  };

  return (
    <button
      disabled={youtubeLoading || !token}
      onClick={connectYouTube}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
    >
      {youtubeLoading ? (
        <Loader2Icon className="w-5 h-5 animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a2.998 2.998 0 0 0-2.116-2.116C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.382.57a2.998 2.998 0 0 0-2.116 2.116C0 8.048 0 12 0 12s0 3.952.502 5.814a2.998 2.998 0 0 0 2.116 2.116C4.48 20.5 12 20.5 12 20.5s7.52 0 9.382-.57a2.998 2.998 0 0 0 2.116-2.116C24 15.952 24 12 24 12s0-3.952-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )}
      Connect YouTube Account
    </button>
  );
}
