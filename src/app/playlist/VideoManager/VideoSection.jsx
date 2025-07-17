/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Plyr from "plyr";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import API from "../../../utils/axiosInstance.jsx";

function VideoSection() {
  const { id } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [plyrInitialized, setPlyrInitialized] = useState(false);
  const [theme, setTheme] = useState(() => {
    const dark = localStorage.getItem("Dark");
    return dark ? JSON.parse(dark) : true;
  });

  const videoRef = useRef(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const videoRes = await API.get(`/users/videos/${id}`);
        setVideoData(videoRes.data);

        const commentsRes = await API.get(`/users/videos/${id}/comments`);
        setComments(commentsRes.data);
      } catch (error) {
        toast.error("Error loading video or comments.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [id]);

  useEffect(() => {
    if (videoRef.current && !plyrInitialized) {
      new Plyr(videoRef.current, { autoplay: true });
      setPlyrInitialized(true);
    }
  }, [videoRef, plyrInitialized]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await API.post(`/users/videos/${id}/comments`, {
        content: comment,
      });
      setComments([...comments, res.data]);
      setComment("");
    } catch (error) {
      toast.error("Error posting comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await API.delete(`/users/videos/${id}/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success("Comment deleted.");
    } catch (error) {
      toast.error("Error deleting comment.");
    }
  };

  return (
    <div className={`video-section ${theme ? "dark" : "light"} p-4`}>
      {loading ? (
        <SkeletonTheme baseColor="#202020" highlightColor="#444">
          <Skeleton height={400} className="mb-4" />
          <Skeleton height={20} count={3} />
        </SkeletonTheme>
      ) : (
        <>
          <div className="video-player mb-6">
            <video ref={videoRef} controls className="w-full rounded-md">
              <source src={videoData?.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-info mt-4">
              <h1 className="text-2xl font-semibold mb-2">
                {videoData?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {videoData?.description}
              </p>
            </div>
          </div>

          <div className="comments-section">
            <h2 className="text-xl font-semibold mb-3">Comments</h2>
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded resize-none dark:bg-gray-800 dark:text-white"
                rows={3}
              />
              <button
                type="submit"
                disabled={commentLoading}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {commentLoading ? "Posting..." : "Post Comment"}
              </button>
            </form>

            <div className="comments-list space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                  >
                    <p className="text-sm">{comment.content}</p>
                    <button
                      onClick={() => handleCommentDelete(comment._id)}
                      className="text-red-500 text-xs mt-1 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
}

export default VideoSection;
