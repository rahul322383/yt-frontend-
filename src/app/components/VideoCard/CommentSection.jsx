
/* eslint-disable no-unused-vars */

"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiHeart, 
  FiMessageSquare, 
  FiShare2, 
  FiMoreVertical, 
  FiEdit2, 
  FiTrash2, 
  FiFlag 
} from "react-icons/fi";
import API from "../../../utils/axiosInstance";
import { useAuth } from "../../../context/AuthContext";

export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyMap, setReplyMap] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [processing, setProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const { auth } = useAuth();
  const token = auth.token;

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors }, 
    watch 
  } = useForm();
  const contentValue = watch("content");

  useEffect(() => {
    if (videoId) fetchComments(page);
  }, [videoId, page]);


  const fetchComments = async (pageNumber = 1) => {
  setLoading(true);
  try {
    const res = await API.get(
      `/users/comments/${videoId}?page=${pageNumber}&limit=10`
    );
    let commentsData = res?.data?.data?.comments || [];

    // normalize replies to always have ownerDetails
    const normalizeReplies = (list) =>
      list.map(c => ({
        ...c,
        ownerDetails: c.ownerDetails || c.replyOwnerDetails, // fallback
        replies: normalizeReplies(c.replies || []),
      }));

    commentsData = normalizeReplies(commentsData);

    setComments(commentsData);
    setTotalPages(res?.data?.data?.totalPages || 1);
  } catch (error) {
    console.error("Failed to fetch comments", error);
    toast.error(error.response?.data?.message || "Failed to fetch comments");
  } finally {
    setLoading(false);
  }
};

  const onSubmit = async (data) => {
    const content = data.content?.trim();
    if (!auth.isAuthenticated) return toast.error("Please login to comment");
    if (!content) return toast.error("Comment cannot be empty");

    try {
      setProcessing(true);
      const res = await API.post(
        `/users/comments/${videoId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newComment = res?.data?.data;
      setComments(prev => [{ ...newComment, replies: [] }, ...prev]);
      reset();
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Failed to post comment", error);
      toast.error(error.response?.data?.message || "Failed to post comment");
    } finally {
      setProcessing(false);
    }
  };



  const handleReply = async (parentId) => {
  const replyContent = replyMap[parentId]?.trim();
  if (!auth.isAuthenticated) return toast.error("Please login to reply");
  if (!replyContent) return toast.error("Reply cannot be empty");

  try {
    setProcessing(true);
    const res = await API.post(
      `/users/comments/${parentId}/reply`,
      { content: replyContent, video: videoId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    let newReply = res?.data?.data;
    // normalize new reply
    newReply = {
      ...newReply,
      ownerDetails: newReply.ownerDetails || newReply.replyOwnerDetails,
    };

    const updateReplies = (list) =>
      list.map(comment => {
        if (comment._id === parentId) {
          return { ...comment, replies: [...(comment.replies || []), newReply] };
        }
        return { ...comment, replies: updateReplies(comment.replies || []) };
      });

    setComments(prev => updateReplies(prev));
    toast.success("Reply added");
  } catch (error) {
    console.error("Failed to add reply", error);
    toast.error(error.response?.data?.message || "Failed to add reply");
  } finally {
    setReplyMap(prev => ({ ...prev, [parentId]: "" }));
    setProcessing(false);
  }
};


  const handleLike = async (commentId) => {
    if (!auth.isAuthenticated) return toast.error("Please login to like comments");

    const toggleLike = (list) =>
      list.map(comment => {
        if (comment._id === commentId) {
          const liked = comment.isLikedByUser;
          return {
            ...comment,
            isLikedByUser: !liked,
            likesCount: liked ? comment.likesCount - 1 : comment.likesCount + 1,
          };
        }
        return {
          ...comment,
          replies: toggleLike(comment.replies || []),
        };
      });

    setComments(prev => toggleLike(prev));

    try {
      await API.post(
        `/users/comments/${commentId}/like`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to update like", error);
      toast.error(error.response?.data?.message || "Failed to update like");
      fetchComments(page);
    }
  };

  const findCommentById = (comments, id) => {
    for (const comment of comments) {
      if (comment._id === id) return comment;
      if (comment.replies?.length) {
        const found = findCommentById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDelete = async (commentId) => {
    if (!auth.isAuthenticated) {
      toast.error("Please login to delete comments");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      setProcessing(true);
      const commentToDelete = findCommentById(comments, commentId);
      if (!commentToDelete) {
        toast.error("Comment not found");
        return;
      }

      if (commentToDelete.ownerDetails._id !== auth.user?._id) {
        toast.error("You can only delete your own comments");
        return;
      }

      await API.delete(`/users/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const deleteRecursive = (list) =>
        list
          .filter(comment => comment._id !== commentId)
          .map(comment => ({
            ...comment,
            replies: deleteRecursive(comment.replies || []),
          }));

      setComments(prev => deleteRecursive(prev));
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete comment");
      fetchComments(page);
    } finally {
      setProcessing(false);
    }
  };


 const handleUpdate = async (commentId, newContent) => {
  if (!auth.isAuthenticated) {
    toast.error("Please login to edit comments");
    return;
  }

  if (!newContent?.trim()) return;

  try {
    setProcessing(true);
    const res = await API.patch(
      `/users/comments/${commentId}`,
      { content: newContent.trim() },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    let updatedComment = res?.data?.data;
    updatedComment = {
      ...updatedComment,
      ownerDetails: updatedComment.ownerDetails || updatedComment.replyOwnerDetails,
    };

    const updateContent = (list) =>
      list.map((comment) => {
        if (comment._id === commentId) {
          return { ...comment, content: newContent, ownerDetails: updatedComment.ownerDetails };
        }
        return { ...comment, replies: updateContent(comment.replies || []) };
      });

    setComments((prev) => updateContent(prev));
    toast.success("Comment updated");
  } catch (error) {
    console.error("Update error:", error);
    toast.error(error.response?.data?.message || "Failed to update comment");
    fetchComments(page);
  } finally {
    setProcessing(false);
  }
};

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleShare = (comment) => {
    navigator.clipboard.writeText(
      `${window.location.href}#comment-${comment._id}`
    );
    toast.success("Comment link copied!");
    setOpenMenuId(null);
  };

  const handleReport = async (commentId) => {
    try {
      setProcessing(true);
      await API.post(
        `/users/comments/${commentId}/report`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Report submitted!");
    } catch (error) {
      console.error("Report error:", error);
      toast.error(error?.response?.data?.message || "Report failed");
    } finally {
      setProcessing(false);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Toaster position="top-right" />
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-200">
        Comments ({comments.length})
      </h2>

      <motion.form 
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 mb-6"
      >
        <div className="flex gap-3">
          <img
            src={auth.isAuthenticated ? (auth.user?.avatar || "/default-avatar.png") : "/default-avatar.png"}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            alt="User avatar"
          />
          <div className="flex-1">
            <textarea
              {...register("content", { required: true })}
              placeholder={auth.isAuthenticated ? "Add a comment..." : "Please login to comment"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              disabled={!auth.isAuthenticated || processing}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">Comment is required</p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={!contentValue?.trim() || !auth.isAuthenticated || processing}
          >
            {processing ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </motion.form>

      {loading ? (
        <div className="flex flex-col items-center py-10">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 text-gray-500 bg-gray-100 rounded-lg"
        >
          No comments yet. Be the first to comment!
        </motion.div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentCard
              key={comment._id}
              comment={comment}
              currentUser={auth.user}
              replyMap={replyMap}
              setReplyMap={setReplyMap}
              handleReply={handleReply}
              handleLike={handleLike}
              handleDelete={handleDelete}
              handleUpdate={handleUpdate}
              isAuthenticated={auth.isAuthenticated}
              openMenuId={openMenuId}
              toggleMenu={toggleMenu}
              handleShare={handleShare}
              handleReport={handleReport}
              toggleReplies={toggleReplies}
              expandedReplies={expandedReplies}
              processing={processing}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function CommentCard({
  comment,
  currentUser,
  replyMap,
  setReplyMap,
  handleReply,
  handleLike,
  handleDelete,
  handleUpdate,
  isAuthenticated,
  openMenuId,
  toggleMenu,
  handleShare,
  handleReport,
  toggleReplies,
  expandedReplies,
  processing,
}) {
  const menuRef = useRef(null);
  const replyInputRef = useRef(null);
  const showReplies = expandedReplies[comment._id] ?? true;
  const isOwner = currentUser?._id === comment.ownerDetails?._id;
  const [isEditing, setIsEditing] = useState(false);
 const [editContent, setEditContent] = useState(comment.content);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (openMenuId === comment._id) toggleMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId, comment._id]);

  return (
    <motion.div 
      id={`comment-${comment._id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors relative shadow-sm"
    >
      <div className="flex gap-3 relative">
        <img
          src={comment.ownerDetails?.avatar || "/default-avatar.png"}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          alt={`${comment.ownerDetails?.username}'s avatar`}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <span className="font-semibold text-gray-800">
                {comment.ownerDetails?.username}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => toggleMenu(comment._id)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Comment options"
                disabled={processing}
              >
                <FiMoreVertical className="text-gray-500" />
              </button>

              <AnimatePresence>
                {openMenuId === comment._id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48 overflow-hidden"
                  >
                    {isOwner && (
                      <>
                        <button
  onClick={() => {
    toggleMenu(null);
    setIsEditing(true);
  }}
  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
  disabled={processing}
>
  <FiEdit2 className="mr-2" /> Edit
</button>

                        <button
                          onClick={() => {
                            toggleMenu(null);
                            handleDelete(comment._id);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                          disabled={processing}
                        >
                          <FiTrash2 className="mr-2" /> Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        toggleMenu(null);
                        handleShare(comment);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiShare2 className="mr-2" /> Share
                    </button>
                    {!isOwner && isAuthenticated && (
                      <button
                        onClick={() => {
                          toggleMenu(null);
                          handleReport(comment._id);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={processing}
                      >
                        <FiFlag className="mr-2" /> Report
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

         {isEditing ? (
  <div className="flex flex-col gap-2 mb-3">
    <textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg text-sm text-black"
      rows="2"
    />
    <div className="flex gap-2">
      <button
        onClick={() => {
          handleUpdate(comment._id, editContent);
          setIsEditing(false);
        }}
        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        disabled={processing}
      >
        Save
      </button>
      <button
        onClick={() => {
          setIsEditing(false);
          setEditContent(comment.content); // reset
        }}
        className="px-3 py-1 bg-gray-300 text-sm rounded-lg hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  </div>
) : (
  <p className="text-gray-700 whitespace-pre-wrap break-words mb-3">
    {comment.content}
  </p>
)}


          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(comment._id)}
              className={`flex items-center gap-1 text-sm ${
                comment.isLikedByUser ? "text-red-500 font-medium" : "text-gray-500"
              }`}
              aria-label={comment.isLikedByUser ? "Unlike comment" : "Like comment"}
              disabled={processing}
            >
              <FiHeart className={comment.isLikedByUser ? "fill-current" : ""} />
              <span>{comment.likesCount || 0}</span>
            </button>

            <button
              onClick={() => {
                toggleReplies(comment._id);
                if (replyInputRef.current && !showReplies) {
                  replyInputRef.current.focus();
                }
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              disabled={processing}
            >
              <FiMessageSquare />
              <span>{comment.replies?.length || 0} replies</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  toggleReplies(comment._id);
                  if (replyInputRef.current) {
                    replyInputRef.current.focus();
                  }
                }}
                className="text-sm text-blue-500 hover:text-blue-700"
                disabled={processing}
              >
                Reply
              </button>
            )}
          </div>

          {isAuthenticated && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex gap-2">
                <input
                  ref={replyInputRef}
                  type="text"
                  value={replyMap[comment._id] || ""}
                  onChange={(e) =>
                    setReplyMap((prev) => ({ ...prev, [comment._id]: e.target.value }))
                  }
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-blue-500 transition-colors"
                  disabled={processing}
                />
                <button
                  onClick={() => handleReply(comment._id)}
                  className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  disabled={!replyMap[comment._id]?.trim() || processing}
                >
                  {processing ? "Posting..." : "Post"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className={`mt-4 pl-4 border-l-2 border-gray-200 ${
          !showReplies ? 'hidden' : ''
        }`}>
          <AnimatePresence>
            {showReplies && comment.replies.map((reply) => (
              <motion.div
                key={reply._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CommentCard
                  comment={reply}
                  currentUser={currentUser}
                  replyMap={replyMap}
                  setReplyMap={setReplyMap}
                  handleReply={handleReply}
                  handleLike={handleLike}
                  handleDelete={handleDelete}
                  handleUpdate={handleUpdate}
                  isAuthenticated={isAuthenticated}
                  openMenuId={openMenuId}
                  toggleMenu={toggleMenu}
                  handleShare={handleShare}
                  handleReport={handleReport}
                  toggleReplies={toggleReplies}
                  expandedReplies={expandedReplies}
                  processing={processing}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/* eslint-disable no-unused-vars */

// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useForm } from "react-hook-form";
// import { toast, Toaster } from "react-hot-toast";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   FiHeart, 
//   FiMessageSquare, 
//   FiShare2, 
//   FiMoreVertical, 
//   FiEdit2, 
//   FiTrash2, 
//   FiFlag 
// } from "react-icons/fi";
// import API from "../../../utils/axiosInstance";
// import { useAuth } from "../../../context/AuthContext";

// export default function CommentSection({ videoId }) {
//   const [comments, setComments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [replyMap, setReplyMap] = useState({});
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [expandedReplies, setExpandedReplies] = useState({});
//   const [processing, setProcessing] = useState(false);

//   const { auth } = useAuth();
//   const token = auth.token;

//   const { 
//     register, 
//     handleSubmit, 
//     reset, 
//     formState: { errors }, 
//     watch 
//   } = useForm();
//   const contentValue = watch("content");

//   useEffect(() => {
//     if (videoId) fetchComments(page);
//   }, [videoId, page]);

//   // Clean up expanded replies when videoId changes
//   useEffect(() => {
//     setExpandedReplies({});
//   }, [videoId]);

//   const fetchComments = async (pageNumber = 1) => {
//     setLoading(true);
//     try {
//       const res = await API.get(
//         `/users/comments/${videoId}?page=${pageNumber}&limit=10`
//       );
//       let commentsData = res?.data?.data?.comments || [];

//       // normalize replies to always have ownerDetails
//       const normalizeReplies = (list) =>
//         list.map(c => ({
//           ...c,
//           ownerDetails: c.ownerDetails || c.replyOwnerDetails, // fallback
//           replies: normalizeReplies(c.replies || []),
//         }));

//       commentsData = normalizeReplies(commentsData);

//       setComments(commentsData);
//       setTotalPages(res?.data?.data?.totalPages || 1);
//     } catch (error) {
//       console.error("Failed to fetch comments", error);
//       const errorMessage = error.response?.data?.message || error.message || "Failed to fetch comments";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onSubmit = async (data) => {
//     const content = data.content?.trim();
//     if (!auth.isAuthenticated || !token) return toast.error("Please login to comment");
//     if (!content) return toast.error("Comment cannot be empty");

//     try {
//       setProcessing(true);
//       const res = await API.post(
//         `/users/comments/${videoId}`,
//         { content },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const newComment = res?.data?.data;
//       setComments(prev => [{ ...newComment, replies: [] }, ...prev]);
//       reset();
//       toast.success("Comment posted!");
//     } catch (error) {
//       console.error("Failed to post comment", error);
//       const errorMessage = error.response?.data?.message || error.message || "Failed to post comment";
//       toast.error(errorMessage);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleReply = async (parentId) => {
//     const replyContent = replyMap[parentId]?.trim();
//     if (!auth.isAuthenticated || !token) return toast.error("Please login to reply");
//     if (!replyContent) return toast.error("Reply cannot be empty");

//     try {
//       setProcessing(true);
//       const res = await API.post(
//         `/users/comments/${parentId}/reply`,
//         { content: replyContent, video: videoId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       let newReply = res?.data?.data;
//       // normalize new reply
//       newReply = {
//         ...newReply,
//         ownerDetails: newReply.ownerDetails || newReply.replyOwnerDetails,
//       };

//       const updateReplies = (list) =>
//         list.map(comment => {
//           if (comment._id === parentId) {
//             return { ...comment, replies: [...(comment.replies || []), newReply] };
//           }
//           return { ...comment, replies: updateReplies(comment.replies || []) };
//         });

//       setComments(prev => updateReplies(prev));
//       toast.success("Reply added");
//     } catch (error) {
//       console.error("Failed to add reply", error);
//       const errorMessage = error.response?.data?.message || error.message || "Failed to add reply";
//       toast.error(errorMessage);
//     } finally {
//       setReplyMap(prev => ({ ...prev, [parentId]: "" }));
//       setProcessing(false);
//     }
//   };

//   const handleLike = async (commentId) => {
//     if (!auth.isAuthenticated || !token) return toast.error("Please login to like comments");

//     const toggleLike = (list) =>
//       list.map(comment => {
//         if (comment._id === commentId) {
//           const liked = comment.isLikedByUser;
//           return {
//             ...comment,
//             isLikedByUser: !liked,
//             likesCount: liked ? comment.likesCount - 1 : comment.likesCount + 1,
//           };
//         }
//         return {
//           ...comment,
//           replies: toggleLike(comment.replies || []),
//         };
//       });

//     setComments(prev => toggleLike(prev));

//     try {
//       await API.post(
//         `/users/comments/${commentId}/like`, 
//         {}, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     } catch (error) {
//       console.error("Failed to update like", error);
//       const errorMessage = error.response?.data?.message || error.message || "Failed to update like";
//       toast.error(errorMessage);
//       // Don't refetch on error to avoid infinite loops
//     }
//   };

//   const findCommentById = (comments, id) => {
//     for (const comment of comments) {
//       if (comment._id === id) return comment;
//       if (comment.replies?.length) {
//         const found = findCommentById(comment.replies, id);
//         if (found) return found;
//       }
//     }
//     return null;
//   };

//   const handleDelete = async (commentId) => {
//     if (!auth.isAuthenticated || !token) {
//       toast.error("Please login to delete comments");
//       return;
//     }

//     if (!window.confirm("Are you sure you want to delete this comment?")) return;

//     try {
//       setProcessing(true);
//       const commentToDelete = findCommentById(comments, commentId);
//       if (!commentToDelete) {
//         toast.error("Comment not found");
//         return;
//       }

//       if (commentToDelete.ownerDetails._id !== auth.user?._id) {
//         toast.error("You can only delete your own comments");
//         return;
//       }

//       await API.delete(`/users/comments/${commentId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const deleteRecursive = (list) =>
//         list
//           .filter(comment => comment._id !== commentId)
//           .map(comment => ({
//             ...comment,
//             replies: deleteRecursive(comment.replies || []),
//           }));

//       setComments(prev => deleteRecursive(prev));
//       toast.success("Comment deleted");
//     } catch (error) {
//       console.error("Delete error:", error);
//       const errorMessage = error.response?.data?.message || error.message || "Failed to delete comment";
//       toast.error(errorMessage);
//       // Don't refetch on error to avoid infinite loops
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleUpdate = async (commentId, newContent) => {
//     if (!auth.isAuthenticated || !token) {
//       toast.error("Please login to edit comments");
//       return;
//     }

//     if (!newContent?.trim()) return;

//     try {
//       setProcessing(true);
//       const res = await API.patch(
//         `/users/comments/${commentId}`,
//         { content: newContent.trim() },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       let updatedComment = res?.data?.data;
//       updatedComment = {
//         ...updatedComment,
//         ownerDetails: updatedComment.ownerDetails || updatedComment.replyOwnerDetails,
//       };

//       const updateContent = (list) =>
//         list.map((comment) => {
//           if (comment._id === commentId) {
//             return { ...comment, content: newContent, ownerDetails: updatedComment.ownerDetails };
//           }
//           return { ...comment, replies: updateContent(comment.replies || []) };
//         });

//       setComments((prev) => updateContent(prev));
//       toast.success("Comment updated");
//     } catch (error) {
//       console.error("Update error:", error);
//       const errorMessage = error.response?.data?.message || error.message || "Failed to update comment";
//       toast.error(errorMessage);
//       // Don't refetch on error to avoid infinite loops
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const toggleMenu = useCallback((id) => {
//     setOpenMenuId(openMenuId === id ? null : id);
//   }, [openMenuId]);

//   const handleShare = (comment) => {
//     navigator.clipboard.writeText(
//       `${window.location.href}#comment-${comment._id}`
//     );
//     toast.success("Comment link copied!");
//     setOpenMenuId(null);
//   };

//   const handleReport = async (commentId) => {
//     if (!auth.isAuthenticated || !token) {
//       toast.error("Please login to report comments");
//       return;
//     }
    
//     try {
//       setProcessing(true);
//       await API.post(
//         `/users/comments/${commentId}/report`, 
//         {}, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Report submitted!");
//     } catch (error) {
//       console.error("Report error:", error);
//       const errorMessage = error.response?.data?.message || error.message || "Report failed";
//       toast.error(errorMessage);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const toggleReplies = useCallback((commentId) => {
//     setExpandedReplies(prev => ({
//       ...prev,
//       [commentId]: !prev[commentId]
//     }));
//   }, []);

//   return (
//     <div className="max-w-4xl mx-auto p-4 md:p-6">
//       <Toaster position="top-right" />
//       <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-200">
//         Comments ({comments.length})
//       </h2>

//       <motion.form 
//         onSubmit={handleSubmit(onSubmit)}
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col gap-3 mb-6"
//       >
//         <div className="flex gap-3">
//           <img
//             src={auth.isAuthenticated ? (auth.user?.avatar || "/default-avatar.png") : "/default-avatar.png"}
//             className="w-10 h-10 rounded-full object-cover flex-shrink-0"
//             alt="User avatar"
//           />
//           <div className="flex-1">
//             <textarea
//               {...register("content", { required: true })}
//               placeholder={auth.isAuthenticated ? "Add a comment..." : "Please login to comment"}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//               rows="3"
//               disabled={!auth.isAuthenticated || processing}
//             />
//             {errors.content && (
//               <p className="text-red-500 text-sm mt-1">Comment is required</p>
//             )}
//           </div>
//         </div>
//         <div className="flex justify-end">
//           <button
//             type="submit"
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//             disabled={!contentValue?.trim() || !auth.isAuthenticated || processing}
//           >
//             {processing ? "Posting..." : "Post Comment"}
//           </button>
//         </div>
//       </motion.form>

//       {loading ? (
//         <div className="flex flex-col items-center py-10">
//           <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
//           <p className="mt-3 text-gray-600">Loading comments...</p>
//         </div>
//       ) : comments.length === 0 ? (
//         <motion.div 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="text-center py-10 text-gray-500 bg-gray-100 rounded-lg"
//         >
//           No comments yet. Be the first to comment!
//         </motion.div>
//       ) : (
//         <div className="space-y-4">
//           {comments.map(comment => (
//             <CommentCard
//               key={comment._id}
//               comment={comment}
//               currentUser={auth.user}
//               replyMap={replyMap}
//               setReplyMap={setReplyMap}
//               handleReply={handleReply}
//               handleLike={handleLike}
//               handleDelete={handleDelete}
//               handleUpdate={handleUpdate}
//               isAuthenticated={auth.isAuthenticated}
//               openMenuId={openMenuId}
//               toggleMenu={toggleMenu}
//               handleShare={handleShare}
//               handleReport={handleReport}
//               toggleReplies={toggleReplies}
//               expandedReplies={expandedReplies}
//               processing={processing}
//             />
//           ))}
//         </div>
//       )}

//       {totalPages > 1 && (
//         <div className="flex justify-center items-center gap-4 mt-8">
//           <button
//             disabled={page <= 1}
//             onClick={() => setPage(p => p - 1)}
//             className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
//           >
//             Previous
//           </button>
//           <span className="text-sm text-gray-600">
//             Page {page} of {totalPages}
//           </span>
//           <button
//             disabled={page >= totalPages}
//             onClick={() => setPage(p => p + 1)}
//             className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function CommentCard({
//   comment,
//   currentUser,
//   replyMap,
//   setReplyMap,
//   handleReply,
//   handleLike,
//   handleDelete,
//   handleUpdate,
//   isAuthenticated,
//   openMenuId,
//   toggleMenu,
//   handleShare,
//   handleReport,
//   toggleReplies,
//   expandedReplies,
//   processing,
// }) {
//   const menuRef = useRef(null);
//   const replyInputRef = useRef(null);
//   const showReplies = expandedReplies[comment._id] ?? false; // Fixed: default to false
//   const isOwner = currentUser?._id === comment.ownerDetails?._id;
//   const [isEditing, setIsEditing] = useState(false);
//   const [editContent, setEditContent] = useState(comment.content);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         if (openMenuId === comment._id) toggleMenu(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [openMenuId, comment._id, toggleMenu]); // Added toggleMenu to dependency array

//   return (
//     <motion.div 
//       id={`comment-${comment._id}`}
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.2 }}
//       className="bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors relative shadow-sm"
//     >
//       <div className="flex gap-3 relative">
//         <img
//           src={comment.ownerDetails?.avatar || "/default-avatar.png"}
//           className="w-10 h-10 rounded-full object-cover flex-shrink-0"
//           alt={`${comment.ownerDetails?.username}'s avatar`}
//         />
        
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between mb-1">
//             <div>
//               <span className="font-semibold text-gray-800">
//                 {comment.ownerDetails?.username}
//               </span>
//               <span className="text-xs text-gray-500 ml-2">
//                 {new Date(comment.createdAt).toLocaleString()}
//               </span>
//             </div>
            
//             <div className="relative" ref={menuRef}>
//               <button
//                 onClick={() => toggleMenu(comment._id)}
//                 className="p-1 rounded-full hover:bg-gray-200 transition-colors"
//                 aria-label="Comment options"
//                 disabled={processing}
//               >
//                 <FiMoreVertical className="text-gray-500" />
//               </button>

//               <AnimatePresence>
//                 {openMenuId === comment._id && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48 overflow-hidden"
//                   >
//                     {isOwner && (
//                       <>
//                         <button
//                           onClick={() => {
//                             toggleMenu(null);
//                             setIsEditing(true);
//                           }}
//                           className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                           disabled={processing}
//                         >
//                           <FiEdit2 className="mr-2" /> Edit
//                         </button>

//                         <button
//                           onClick={() => {
//                             toggleMenu(null);
//                             handleDelete(comment._id);
//                           }}
//                           className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
//                           disabled={processing}
//                         >
//                           <FiTrash2 className="mr-2" /> Delete
//                         </button>
//                       </>
//                     )}
//                     <button
//                       onClick={() => {
//                         toggleMenu(null);
//                         handleShare(comment);
//                       }}
//                       className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       <FiShare2 className="mr-2" /> Share
//                     </button>
//                     {!isOwner && isAuthenticated && (
//                       <button
//                         onClick={() => {
//                           toggleMenu(null);
//                           handleReport(comment._id);
//                         }}
//                         className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         disabled={processing}
//                       >
//                         <FiFlag className="mr-2" /> Report
//                       </button>
//                     )}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>

//           {isEditing ? (
//             <div className="flex flex-col gap-2 mb-3">
//               <textarea
//                 value={editContent}
//                 onChange={(e) => setEditContent(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg text-sm text-black"
//                 rows="2"
//               />
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => {
//                     handleUpdate(comment._id, editContent);
//                     setIsEditing(false);
//                   }}
//                   className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
//                   disabled={processing}
//                 >
//                   Save
//                 </button>
//                 <button
//                   onClick={() => {
//                     setIsEditing(false);
//                     setEditContent(comment.content); // reset
//                   }}
//                   className="px-3 py-1 bg-gray-300 text-sm rounded-lg hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <p className="text-gray-700 whitespace-pre-wrap break-words mb-3">
//               {comment.content}
//             </p>
//           )}

//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => handleLike(comment._id)}
//               className={`flex items-center gap-1 text-sm ${
//                 comment.isLikedByUser ? "text-red-500 font-medium" : "text-gray-500"
//               }`}
//               aria-label={comment.isLikedByUser ? "Unlike comment" : "Like comment"}
//               disabled={processing || !isAuthenticated}
//             >
//               <FiHeart className={comment.isLikedByUser ? "fill-current" : ""} />
//               <span>{comment.likesCount || 0}</span>
//             </button>

//             <button
//               onClick={() => {
//                 toggleReplies(comment._id);
//                 if (replyInputRef.current && !showReplies) {
//                   replyInputRef.current.focus();
//                 }
//               }}
//               className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
//               disabled={processing}
//             >
//               <FiMessageSquare />
//               <span>{comment.replies?.length || 0} replies</span>
//             </button>

//             {isAuthenticated && (
//               <button
//                 onClick={() => {
//                   toggleReplies(comment._id);
//                   if (replyInputRef.current) {
//                     replyInputRef.current.focus();
//                   }
//                 }}
//                 className="text-sm text-blue-500 hover:text-blue-700"
//                 disabled={processing}
//               >
//                 Reply
//               </button>
//             )}
//           </div>

//           {isAuthenticated && (
//             <motion.div 
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="mt-3 overflow-hidden"
//             >
//               <div className="flex gap-2">
//                 <input
//                   ref={replyInputRef}
//                   type="text"
//                   value={replyMap[comment._id] || ""}
//                   onChange={(e) =>
//                     setReplyMap((prev) => ({ ...prev, [comment._id]: e.target.value }))
//                   }
//                   placeholder="Write a reply..."
//                   className="flex-1 px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-blue-500 transition-colors"
//                   disabled={processing}
//                 />
//                 <button
//                   onClick={() => handleReply(comment._id)}
//                   className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//                   disabled={!replyMap[comment._id]?.trim() || processing}
//                 >
//                   {processing ? "Posting..." : "Post"}
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>

//       {comment.replies?.length > 0 && (
//         <div className={`mt-4 pl-4 border-l-2 border-gray-200 ${
//           !showReplies ? 'hidden' : ''
//         }`}>
//           <AnimatePresence>
//             {showReplies && comment.replies.map((reply) => (
//               <motion.div
//                 key={`${comment._id}-${reply._id}`} // Fixed: unique key with parent prefix
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -10 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 <CommentCard
//                   comment={reply}
//                   currentUser={currentUser}
//                   replyMap={replyMap}
//                   setReplyMap={setReplyMap}
//                   handleReply={handleReply}
//                   handleLike={handleLike}
//                   handleDelete={handleDelete}
//                   handleUpdate={handleUpdate}
//                   isAuthenticated={isAuthenticated}
//                   openMenuId={openMenuId}
//                   toggleMenu={toggleMenu}
//                   handleShare={handleShare}
//                   handleReport={handleReport}
//                   toggleReplies={toggleReplies}
//                   expandedReplies={expandedReplies}
//                   processing={processing}
//                 />
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>
//       )}
//     </motion.div>
//   );
// }