import React, { useState } from "react";
import { toast } from "react-toastify";
import API from "../../../utils/api"; // Adjust path as needed

const DeleteCard = ({
  type = "video", 
  VideoId, PlaylistId,        // 'video' | 'playlist' | 'comment'
  itemId,
  parentId = null,           // For comments, this will be the videoId
  onDeleteSuccess = () => {}, // Callback after successful delete
  className = "",
}) => {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const getDeleteEndpoint = () => {
    switch (type) {
      case "video":
        return `/users/videos/${VideoId}`;
      case "playlist":
        return `/users/playlist/${PlaylistId}`;
      case "comment":
        return `/users/videos/${parentId}/comments/${Id}`;
      default:
        return "";
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const endpoint = getDeleteEndpoint();
      await API.delete(endpoint);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
      onDeleteSuccess(itemId);
    } catch (error) {
      toast.error(`Failed to delete ${type}.`);
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <>
      {!confirming ? (
        <button
          className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ${className}`}
          onClick={() => setConfirming(true)}
        >
          Delete
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Confirm delete?</span>
          <button
            className="bg-red-600 text-white px-3 py-1 rounded"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes"}
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
            onClick={() => setConfirming(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
};

export default DeleteCard;
