
/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../utils/axiosInstance.jsx";
import VideoCard from "../components/VideoCard/VideoCard.jsx";

const PlaylistVideoManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser ,setCurrentUser] = useState( null);

  const videoRefs = useRef({});

  const token = localStorage.getItem("accessToken");
  if(!token)
    navigate("/login");

  // Check for dark mode preference
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    
    const handler = (e) => setDarkMode(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler);
    
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler);
  }, []);

  const fetchPlaylist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/users/playlist/${id}`);
      setPlaylist(res.data.data);
    } catch {
      toast.error("Failed to load playlist.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlaylist();
  }, []);

  if (loading)
    return (
      <div className={`flex justify-center items-center h-[70vh] ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-lg font-semibold`}>
        Loading playlist...
      </div>
    );

  if (!playlist?.videos?.length)
    return (
      <div className={`flex justify-center items-center h-[70vh] ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-lg font-semibold`}>
        No videos found in this playlist.
      </div>
    );

  return (
    <>
      <div className={`max-w-6xl mx-auto p-4 md:p-6 rounded-3xl shadow-lg select-none flex flex-col gap-6 md:gap-10 
        ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        {/* Header */}
        <header className={`border-b pb-4 ${darkMode ? 'border-indigo-600' : 'border-indigo-300'}`}>
          <h2 className={`text-2xl md:text-4xl font-extrabold ${darkMode ? 'text-indigo-300' : 'text-indigo-900'} truncate`}>
            {playlist.name || "Untitled Playlist"}
          </h2>
          {playlist.description && (
            <p className={`mt-2 text-base max-w-lg ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>
              {playlist.description}
            </p>
          )}
        </header>

        {/* Videos Grid */}
        <div className={`flex flex-wrap gap-4 md:gap-25 justify-center md:justify-start items-start 
          max-h-[70vh] overflow-y-auto pr-2
          ${darkMode ? 
            'scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-700' : 
            'scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100'}`}
        >
          {playlist.videos.map((video) => (
            <div
              key={video.videoId}
              ref={(el) => (videoRefs.current[video.videoId] = el)}
              className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] lg:w-[calc(25%-1.5rem)]"
            >
              <VideoCard
                video={video}
                onUpdated={fetchPlaylist}
                playlist={playlist}
                darkMode={darkMode}
                currentUser={currentUser}
              />
            </div>
          ))}
        </div>
      </div>

      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        theme={darkMode ? 'dark' : 'light'}
      />
    </>
  );
};

export default PlaylistVideoManager;