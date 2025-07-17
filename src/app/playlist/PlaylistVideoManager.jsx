/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import API from "../../utils/api.jsx";
import VideoCard from "../components/VideoCard/VideoCard.jsx";

const PlaylistVideoManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef({});

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
  }, [fetchPlaylist]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500 text-lg font-semibold">
        Loading playlist...
      </div>
    );

  if (!playlist?.videos?.length)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-400 text-lg font-semibold">
        No videos found in this playlist.
      </div>
    );

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-3xl shadow-lg select-none flex flex-col gap-10">
        {/* Header */}
        <header className="border-b border-indigo-300 pb-4">
          <h2 className="text-4xl font-extrabold text-indigo-900 truncate">
            {playlist.name || "Untitled Playlist"}
          </h2>
          {playlist.description && (
            <p className="mt-2 text-indigo-700 text-base max-w-lg">
              {playlist.description}
            </p>
          )}
        </header>

        {/* Videos Grid */}
        <div className="flex flex-wrap gap-6 justify-start items-start max-h-[75vh] overflow-y-auto pr-2
          scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100"
        >
          {playlist.videos.map((video) => (
            <div
              key={video.videoId}
              ref={(el) => (videoRefs.current[video.videoId] = el)}
            >
              <VideoCard
                video={video}
                onUpdated={fetchPlaylist}
                playlist={playlist}
              />
            </div>
          ))}
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default PlaylistVideoManager;
