/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { XCircle, Clock } from "lucide-react";
import VideoUpload from "../components/VideoCard/UploadCard.jsx";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../utils/axiosInstance.jsx";
import PlaylistVideoManager from "./PlaylistVideoManager.jsx";

const VideoPlayerModal = ({ videoUrl, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <video src={videoUrl} controls autoPlay className="w-full rounded" />
      </div>
    </div>
  );
};

const PlaylistDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [uploadData, setUploadData] = useState({ title: "", videoRef: "", videoFile: null });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cancelTokenSource, setCancelTokenSource] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check authentication status
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      toast.error('Please login to access this page');
    }
  }, [navigate]);

  const fetchPlaylist = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        checkAuth();
        return;
      }

      const res = await api.get(`/users/playlist/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPlaylist(res.data.data);
      setFormData({
        name: res.data.data.name || "",
        description: res.data.data.description || "",
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        checkAuth();
      } else {
        toast.error("Could not load playlist.");
        navigate("/playlists");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, checkAuth]);

  useEffect(() => {
    checkAuth(); // Check auth on initial load
    if (!id) {
      toast.error("Invalid playlist ID");
      navigate("/playlists");
      return;
    }
    fetchPlaylist();
  }, [id, fetchPlaylist, checkAuth, navigate]);

  // Add token to all API requests
  const apiWithAuth = {
    get: async (url) => {
      const token = localStorage.getItem('token');
      return api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    post: async (url, data) => {
      const token = localStorage.getItem('token');
      return api.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    put: async (url, data) => {
      const token = localStorage.getItem('token');
      return api.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  };

  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    try {
      await apiWithAuth.put(`/users/playlist/${id}`, formData);
      toast.success("Playlist updated!");
      setIsEditMode(false);
      fetchPlaylist();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        checkAuth();
      } else {
        toast.error("Failed to update playlist.");
      }
    }
  };

  const handlePlayVideo = async (videoId) => {
    try {
      const res = await apiWithAuth.get(`/user/playlist/videos/${videoId}`);
      const url = res.data?.data?.url;
      if (url) {
        setVideoUrl(url);
        setIsModalOpen(true);
      } else {
        toast.error("Video URL not found");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        checkAuth();
      } else {
        toast.error("Failed to load video");
      }
    }
  };

  const handleUploadChange = (e) => {
    setUploadData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    setUploadData((prev) => ({ ...prev, videoFile: file }));
  };

  const cancelUpload = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Upload canceled by user.");
      toast("Upload canceled.");
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    const { title, videoRef, videoFile } = uploadData;
    if (!title || !videoFile) return toast.error("Please fill all fields");

    const token = localStorage.getItem('token');
    if (!token) {
      checkAuth();
      return;
    }

    const form = new FormData();
    form.append("title", title);
    form.append("video", videoFile);
    if (videoRef) form.append("videoRef", videoRef);

    const source = axios.CancelToken.source();
    setCancelTokenSource(source);
    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await api.post(`/users/playlist/${id}/videos`, form, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
        cancelToken: source.token,
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        },
      });

      toast.success("Video added!");
      fetchPlaylist();
      setUploadData({ title: "", videoFile: null, videoRef: "" });
    } catch (err) {
      if (axios.isCancel(err)) {
        toast.info("Video upload was canceled.");
      } else if (err.response?.status === 401) {
        localStorage.removeItem('token');
        checkAuth();
      } else {
        toast.error(err?.response?.data?.message || "Upload failed");
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
      <VideoPlayerModal videoUrl={videoUrl} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        {isEditMode ? (
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="text-3xl sm:text-4xl font-bold px-4 py-3 border-2 border-blue-500 rounded-lg w-full dark:bg-gray-800 dark:text-white"
          />
        ) : (
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white">
            {playlist?.name}
          </h1>
        )}
        <Link
          to="/history"
          className="flex items-center gap-2 px-5 py-3 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <Clock className="w-4 h-4" />
          View History
        </Link>
      </div>

      <div className="mb-10">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-300 mb-2">
          Description
        </h3>
        {isEditMode ? (
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 border-2 border-blue-500 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            rows={4}
          />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">{playlist?.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-12">
        <button
          onClick={() => setIsEditMode((prev) => !prev)}
          className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all"
        >
          {isEditMode ? "Cancel" : "Edit Playlist"}
        </button>
        {isEditMode && (
          <button
            onClick={handleUpdatePlaylist}
            className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all"
          >
            Save Changes
          </button>
        )}
      </div>

      <form onSubmit={handleUploadVideo} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-12">
        <h3 className="text-xl font-semibold mb-5 text-gray-700 dark:text-white">
          Upload New Video
        </h3>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <input
            name="title"
            placeholder="Video Title"
            value={uploadData.title}
            onChange={handleUploadChange}
            className="p-4 rounded-lg border-2 border-blue-500 dark:bg-gray-700 dark:text-white hover:text-amber-400 hover:cursor-pointer"
          />
          <input
            name="videoRef"
            placeholder="Video Ref (optional)"
            value={uploadData.videoRef}
            onChange={handleUploadChange}
            className="p-4 rounded-lg border-2 border-blue-500 dark:bg-gray-700 dark:text-white hover:cursor-pointer"
          />
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoFileChange}
            className="md:col-span-2 p-4 rounded-lg border-2 bg-white dark:bg-gray-700 dark:text-white cursor-pointer"
          />
        </div>

        {uploading ? (
          <div className="mb-4">
            <progress value={uploadProgress} max="100" className="w-full h-3 rounded-lg" />
            <button
              type="button"
              onClick={cancelUpload}
              className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all"
            >
              Cancel Upload
            </button>
          </div>
        ) : (
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md"
          >
            Upload Video
          </button>
        )}
      </form>

      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition-all dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Upload Video
        </button>

        {isModalOpen && (
          <VideoUpload onClose={() => setIsModalOpen(false)} />
        )}
      </div>

      <PlaylistVideoManager playlist={playlist} onPlay={handlePlayVideo} />
    </div>
  );
};

export default PlaylistDetailsPage;