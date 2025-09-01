
"use client";

import { useEffect, useRef, useState } from "react";
import API from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { Loader2Icon, CheckCircle, XCircle, Youtube } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function YouTubeConnect({ 
  setFormData, 
  youtubeLoading, 
  setYoutubeLoading,
  youtubeConnected,
  youtubeChannel 
}) {
  const { auth, checkAuth } = useAuth();
  const token = auth?.user ? localStorage.getItem("accessToken") : null;
  const popupRef = useRef(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Get Auth URL from backend
  const getAuthUrl = async () => {
    if (!token) return null;

    try {
      const response = await API.get("/users/auth-url", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response?.data?.data;
      if (!data?.authUrl) throw new Error("No auth URL returned from server");
      return data.authUrl;
    } catch (error) {
      console.error("Failed to get YouTube auth URL:", error);
      toast.error("Failed to get YouTube auth URL");
      return null;
    }
  };

  // Connect YouTube
  const connectYouTube = async () => {
    if (!token) {
      toast.error("You must be logged in to connect YouTube");
      return;
    }

    setYoutubeLoading(true);
    const authUrl = await getAuthUrl();
    if (!authUrl) {
      setYoutubeLoading(false);
      return;
    }

    // Open popup
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    popupRef.current = window.open(
      authUrl,
      "youtube_oauth",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!popupRef.current) {
      toast.error("Popup blocked! Please allow popups for this site.");
      setYoutubeLoading(false);
      return;
    }

    popupRef.current.focus();
    toast.success("Complete YouTube connection in the popup");

    // Listener for message from popup
    const handleMessage = (event) => {
      if (event.data?.type === "YOUTUBE_CONNECTED") {
        if (event.data.success) toast.success("YouTube connected!");
        else toast.error(event.data.error || "Failed to connect YouTube");

        checkYouTubeStatus();
        setYoutubeLoading(false);
        checkAuth(); // refresh global auth state
        window.removeEventListener("message", handleMessage);
        popupRef.current = null;
      }
    };

    window.addEventListener("message", handleMessage);
  };

  // Check YouTube status
  const checkYouTubeStatus = async () => {
    if (!token) return;
    
    setCheckingStatus(true);
    
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
    } finally {
      setCheckingStatus(false);
    }
  };
  
  // Check YouTube status on mount
  useEffect(() => {
    checkYouTubeStatus();
  }, []);

  // Disconnect YouTube
  const disconnectYouTube = async () => {
    if (!token) {
      toast.error("You must be logged in to disconnect YouTube");
      return;
    }

    setYoutubeLoading(true);

    try {
      const response = await API.post("/users/disconnect-youtube", null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.success) {
        toast.success("YouTube disconnected!");
        setFormData((prev) => ({
          ...prev,
          youtubeConnected: false,
          youtubeChannel: null,
        }));
      } else {
        toast.error(response?.data?.error || "Failed to disconnect YouTube");
      }
    } catch (error) {
      console.error("Failed to disconnect YouTube:", error);
      toast.error("Failed to disconnect YouTube");
    } finally {
      setYoutubeLoading(false);
    }
  };

  // Cleanup in case component unmounts while popup is open
  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    };
  }, []);

  return (
    <div className="w-full bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">YouTube Connection</h3>
        {checkingStatus && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2Icon className="w-4 h-4 animate-spin mr-1" />
            Checking status...
          </div>
        )}
      </div>
      
      {youtubeConnected ? (
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                Connected to YouTube
              </p>
              {youtubeChannel && (
                <p className="text-xs text-green-600 truncate">
                  Channel: {youtubeChannel}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={checkYouTubeStatus}
              disabled={youtubeLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Loader2Icon className="w-4 h-4" />
              Refresh Status
            </button>
            
            <button
              onClick={disconnectYouTube}
              disabled={youtubeLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <XCircle className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <XCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              YouTube account not connected
            </p>
          </div>
          
          <button
            disabled={youtubeLoading || !token}
            onClick={connectYouTube}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            {youtubeLoading ? (
              <Loader2Icon className="w-5 h-5 animate-spin" />
            ) : (
              <Youtube className="w-5 h-5" />
            )}
            Connect YouTube Account
          </button>
          
          {!token && (
            <p className="text-sm text-red-600 text-center mt-2">
              You must be logged in to connect YouTube
            </p>
          )}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-4">
        Connecting your YouTube account allows you to upload videos directly to your channel.
      </p>
    </div>
  );
}