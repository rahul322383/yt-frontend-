import React, { useEffect, useState } from "react";
import API from "../../../utils/axiosInstance.jsx";

const UploadShortSinglePage = () => {
  const [uploadData, setUploadData] = useState({
    title: "",
    tags: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", tags: "" });

  const fetchVideos = async () => {
    try {
      const res = await API.get("/users/shorts/all");
      setVideos(res.data);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return alert("Please select a video!");

    const formData = new FormData();
    formData.append("video", uploadData.file);
    formData.append("title", uploadData.title);
    formData.append("tags", uploadData.tags);

    try {
      setLoading(true);
      await API.post("/users/shorts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Upload successful!");
      setUploadData({ title: "", tags: "", file: null });
      fetchVideos();
    } catch (err) {
      console.error("Upload Error:", err?.response?.data || err.message);
      alert("❌ Upload failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Delete this video permanently?")) return;
    try {
      await API.delete(`/users/shorts/${id}`);
      fetchVideos();
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  const startEditing = (video) => {
    setEditMode(video._id);
    setEditForm({ title: video.title, tags: video.tags });
  };

  const cancelEditing = () => {
    setEditMode(null);
    setEditForm({ title: "", tags: "" });
  };

  const submitEdit = async (id) => {
    try {
      await API.put(`/users/shorts/${id}`, editForm);
      setEditMode(null);
      fetchVideos();
    } catch (err) {
      console.error("Error updating video:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Compact Upload Form */}
        <div className="bg-white  dark:bg-gray-800 ">
          <div className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Upload Short</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="Title"
                  className="w-full p-2 text-sm rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  name="tags"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  placeholder="Tags (comma separated)"
                  className="w-full p-2 text-sm rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  required
                />
              </div>

              <div className="flex items-center justify-left w-full">
                <label className="flex flex-col w-full border border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-300 dark:border-gray-600 p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-2">
                    <svg
                      className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {uploadData.file ? uploadData.file.name : "Click to upload video"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              {uploadData.file && (
                <div className="mt-2">
                  {/* <video
                    className="w-full max-h-40 rounded border border-gray-200 dark:border-gray-600"
                    controls
                    src={URL.createObjectURL(uploadData.file)}
                  /> */}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 text-sm rounded hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Upload Video"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Uploaded Videos - Compact View */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Your Videos</h2>
          {videos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <svg
                className="mx-auto h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No videos uploaded yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((vid) => (
                <div
                  key={vid._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative aspect-[9/16] bg-black">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      src={vid.videoUrl}
                    />
                  </div>
                  <div className="p-3">
                    {editMode === vid._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full p-1 text-sm rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={editForm.tags}
                          onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                          className="w-full p-1 text-sm rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          placeholder="Tags"
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => submitEdit(vid._id)}
                            className="flex-1 bg-green-600 text-white py-1 text-xs rounded hover:bg-green-700 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex-1 bg-gray-400 text-white py-1 text-xs rounded hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">
                          {vid.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                          Tags: {vid.tags}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(vid)}
                            className="flex-1 text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteVideo(vid._id)}
                            className="flex-1 text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadShortSinglePage;