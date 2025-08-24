/* eslint-disable no-unused-vars */


"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../utils/axiosInstance.jsx";
import PlaylistVideoManager from "./PlaylistVideoManager.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import VideoUpload from "../components/VideoCard/UploadCard.jsx"; // ✅ Upload modal

const PlaylistDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // ✅ Track if user is owner

  // ✅ edit playlist state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDesc, setEditedDesc] = useState("");

  const fetchPlaylist = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users/playlist/${id}`);
      setPlaylist(res.data.data);
      setEditedName(res.data.data?.name || "");
      setEditedDesc(res.data.data?.description || "");
      
      // ✅ Check if current user is the owner of the playlist
      if (auth.isAuthenticated && auth.user && res.data.data) {
        setIsOwner(auth.user._id === res.data.data.owner);
      } else {
        setIsOwner(false);
      }
    } catch (err) {
      toast.error("Could not load playlist.");
      navigate("/playlists");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, auth]);

  useEffect(() => {
    if (id) fetchPlaylist();
  }, [id, fetchPlaylist]);

  const handleUpdatePlaylist = async () => {
    try {
      await API.put(`/users/playlist/${id}`, {
        name: editedName,
        description: editedDesc,
      });
      toast.success("Playlist updated successfully!");
      setIsEditMode(false);
      fetchPlaylist();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Playlist Title */}
      {!isEditMode ? (
        <>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-2">
            {playlist?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {playlist?.description}
          </p>
        </>
      ) : (
        <div className="space-y-4 mb-6">
          <input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Playlist Name"
          />
          <textarea
            value={editedDesc}
            onChange={(e) => setEditedDesc(e.target.value)}
            rows="3"
            className="w-full p-3 rounded-lg border-2 border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Playlist Description"
          />
        </div>
      )}

      {/* Buttons Row - Only show if user is owner */}
      {isOwner && (
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Upload Video */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
          >
            + Upload Video
          </button>

          {/* Edit Playlist */}
          <button
            onClick={() => {
              if (isEditMode) {
                setIsEditMode(false);
              } else {
                setIsEditMode(true);
              }
            }}
            className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
          >
            {isEditMode ? "Cancel" : "Edit Playlist"}
          </button>

          {/* Save Playlist */}
          {isEditMode && (
            <button
              onClick={handleUpdatePlaylist}
              className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow"
            >
              Save Changes
            </button>
          )}

          {/* View History */}
          <Link
            to={`/history`}
            className="flex items-center gap-2 px-5 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow"
          >
            <Clock className="w-4 h-4" />
            <span>View History</span>
          </Link>

          {/* Analytics */}
          <button
            onClick={() => navigate(`/analytics`)}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow"
          >
            View Analytics
          </button>
        </div>
      )}

      {/* Upload Modal - Only show if user is owner */}
      {isUploadOpen && isOwner && (
        <VideoUpload
          playlistId={id}
          onClose={() => setIsUploadOpen(false)}
          refreshPlaylist={fetchPlaylist}
        />
      )}

      {/* Playlist Videos */}
      <PlaylistVideoManager
        playlist={playlist}
        onPlay={() => {}}
        canEdit={isOwner} 
      />
    </div>
  );
};

export default PlaylistDetailsPage;