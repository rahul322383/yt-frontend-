/* eslint-disable no-unused-vars */
// // /* eslint-disable react-hooks/exhaustive-deps */
// // "use client";

// // import React, { useState, useEffect, useRef } from "react";
// // import { useForm } from "react-hook-form";
// // import { toast, Toaster } from "react-hot-toast";
// // import {jwtDecode} from "jwt-decode";
// // import API from "../../../utils/axiosInstance.jsx"; // Your axios instance setup

// // export default function CommentSection({ videoId }) {
// //   const [comments, setComments] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [replyMap, setReplyMap] = useState({}); // To keep track of replies input per comment
// //   const [page, setPage] = useState(1);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [openMenuId, setOpenMenuId] = useState(null);

// //   const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
// //   const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
// //   const contentValue = watch("content");

// //   let currentUserId = null;
// //   if (token) {
// //     try {
// //       const decoded = jwtDecode(token);
// //       currentUserId = decoded?.id || decoded?.userId || null;
// //     } catch (e) {
// //       console.error("Invalid token", e);
// //     }
// //   }

// //   // Fetch comments when videoId or page changes
// //   useEffect(() => {
// //     if (videoId) fetchComments(page);
// //   }, [videoId, page]);

// //   // Fetch comments & build tree of replies
// //   async function fetchComments(pageNumber = 1) {
// //     setLoading(true);
// //     try {
// //       const res = await API.get(`/users/comments/${videoId}?page=${pageNumber}&limit=10`);
// //       const allComments = res?.data?.data?.comments || [];
// //       const total = res?.data?.data?.totalComments || 0;
// //       setTotalPages(Math.ceil(total / 10));

// //       // Build comment tree: map comments by id, nest replies inside parents
// //       const commentMap = {};
// //       allComments.forEach(c => {
// //         commentMap[c._id] = { ...c, replies: [] };
// //       });
// //       const roots = [];
// //       allComments.forEach(c => {
// //         if (c.parentComment && commentMap[c.parentComment]) {
// //           commentMap[c.parentComment].replies.push(commentMap[c._id]);
// //         } else if (!c.parentComment) {
// //           roots.push(commentMap[c._id]);
// //         }
// //       });

// //       setComments(roots);
// //     } catch (error) {
// //       toast.error("Failed to fetch comments");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   // Add new comment
// //   const onSubmit = async (data) => {
// //     const content = data.content?.trim();
// //     if (!token) return toast.error("Login required");
// //     if (!content) return toast.error("Comment cannot be empty");

// //     try {
// //       const res = await API.post(
// //         `/users/comments/${videoId}`,
// //         { content },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       const newComment = res?.data?.data;
// //       setComments(prev => [{ ...newComment, replies: [] }, ...prev]);
// //       reset();
// //       toast.success("Comment posted!");
// //     } catch {
// //       toast.error("Failed to post comment");
// //     }
// //   };

// //   // Add reply to comment
// //   const handleReply = async (parentId) => {
// //     const replyContent = replyMap[parentId]?.trim();
// //     if (!token) return toast.error("Login required");
// //     if (!replyContent) return toast.error("Reply cannot be empty");

// //     try {
// //       const res = await API.post(
// //         `/users/comments/${parentId}/reply`,
// //         { content: replyContent, video: videoId },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       const newReply = res?.data?.data;

// //       // Recursively add reply inside the comment tree
// //       const updateReplies = (list) =>
// //         list.map(comment => {
// //           if (comment._id === parentId) {
// //             return { ...comment, replies: [...(comment.replies || []), { ...newReply, replies: [] }] };
// //           }
// //           return { ...comment, replies: updateReplies(comment.replies || []) };
// //         });

// //       setComments(prev => updateReplies(prev));
// //       toast.success("Reply added");
// //     } catch {
// //       toast.error("Failed to add reply");
// //     } finally {
// //       setReplyMap(prev => ({ ...prev, [parentId]: "" }));
// //     }
// //   };

// //   // Like/unlike comment
// //   const handleLike = async (commentId) => {
// //     if (!token) return toast.error("Login required");

// //     // Toggle like locally first
// //     const toggleLike = (list) =>
// //       list.map(comment => {
// //         if (comment._id === commentId) {
// //           const liked = comment.isLikedByUser;
// //           return {
// //             ...comment,
// //             isLikedByUser: !liked,
// //             likesCount: liked ? comment.likesCount - 1 : comment.likesCount + 1,
// //           };
// //         }
// //         return {
// //           ...comment,
// //           replies: toggleLike(comment.replies || []),
// //         };
// //       });

// //     setComments(prev => toggleLike(prev));

// //     // API call to update like on server
// //     try {
// //       await API.post(`/users/comments/${commentId}/like`, {}, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //     } catch {
// //       toast.error("Failed to update like");
// //       fetchComments(page);
// //     }
// //   };

// //   // Delete comment
// //   const handleDelete = async (commentId) => {
// //     if (!token || !window.confirm("Are you sure you want to delete this comment?")) return;

// //     // Remove comment and its replies locally
// //     const deleteRecursive = (list) =>
// //       list
// //         .filter(comment => comment._id !== commentId)
// //         .map(comment => ({
// //           ...comment,
// //           replies: deleteRecursive(comment.replies || []),
// //         }));

// //     setComments(prev => deleteRecursive(prev));

// //     try {
// //       await API.delete(`/users/comments/${commentId}`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       toast.success("Comment deleted");
// //     } catch {
// //       toast.error("Failed to delete comment");
// //       fetchComments(page);
// //     }
// //   };

// //   // Inline edit comment with prompt
// //   const handleUpdate = async (commentId, oldContent) => {
// //     const newContent = prompt("Edit your comment:", oldContent)?.trim();
// //     if (!token) return toast.error("Login required");
// //     if (!newContent || newContent === oldContent) return;

// //     const updateContent = (list) =>
// //       list.map(comment => {
// //         if (comment._id === commentId) {
// //           return { ...comment, content: newContent };
// //         }
// //         return {
// //           ...comment,
// //           replies: updateContent(comment.replies || []),
// //         };
// //       });

// //     setComments(prev => updateContent(prev));

// //     try {
// //       await API.put(`/users/comments/${commentId}`, {
// //         content: newContent,
// //       }, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       toast.success("Comment updated");
// //     } catch {
// //       toast.error("Failed to update comment");
// //       fetchComments(page);
// //     }
// //   };

// //   // Toggle dropdown menu for comment options
// //   const toggleMenu = (id) => {
// //     setOpenMenuId(openMenuId === id ? null : id);
// //   };

// //   // Copy comment link
// //   const handleShare = (comment) => {
// //     navigator.clipboard.writeText(window.location.href + `#comment-${comment._id}`);
// //     toast.success("Comment link copied!");
// //     setOpenMenuId(null);
// //   };

// //   // Report comment
// //   const handleReport = async (commentId) => {
// //     if (!token) return toast.error("Login required");
// //     try {
// //       await API.post(`/users/comments/${commentId}/report`, {}, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       toast.success("Reported! We'll review this soon.");
// //       setOpenMenuId(null);
// //     } catch (err) {
// //       toast.error(err?.response?.data?.message || "Report failed");
// //     }
// //   };

// //   // Block user
// //   const handleBlock = async (username, userId) => {
// //     if (!token) return toast.error("Login required");
// //     try {
// //       await API.post(`/users/block/${userId}`, {}, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       toast.success(`${username} has been blocked.`);
// //       setOpenMenuId(null);
// //     } catch (err) {
// //       toast.error(err?.response?.data?.message || "Block failed");
// //     }
// //   };

// //   return (
// //     <div className="max-w-3xl mx-auto p-4">
// //       <Toaster />
// //       <h2 className="text-2xl font-bold mb-4">Comments</h2>

// //       {/* Add Comment Input */}
// //       <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 items-start mb-6">
// //         <input
// //           type="text"
// //           {...register("content", { required: true })}
// //           placeholder="Add a comment..."
// //           className="flex-1 p-2 border rounded"
// //         />
// //         <button
// //           type="submit"
// //           className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
// //           disabled={!!errors.content}
// //         >
// //           Post
// //         </button>
// //       </form>

// //       {errors.content && <p className="text-red-500 text-sm mb-4">Comment is required</p>}

// //       {loading ? (
// //         <p>Loading comments...</p>
// //       ) : comments.length === 0 ? (
// //         <p>No comments yet.</p>
// //       ) : (
// //         <div className="space-y-6">
// //           {comments.map(comment => (
// //             <CommentCard
// //               key={comment._id}
// //               comment={comment}
// //               currentUserId={currentUserId}
// //               replyMap={replyMap}
// //               setReplyMap={setReplyMap}
// //               handleReply={handleReply}
// //               handleLike={handleLike}
// //               handleDelete={handleDelete}
// //               handleUpdate={handleUpdate}
// //               token={token}
// //               openMenuId={openMenuId}
// //               toggleMenu={toggleMenu}
// //               handleShare={handleShare}
// //               handleReport={handleReport}
// //               handleBlock={handleBlock}
// //             />
// //           ))}
// //         </div>
// //       )}

// //       {/* Pagination Controls */}
// //       <div className="mt-6 flex justify-between">
// //         <button
// //           disabled={page <= 1}
// //           onClick={() => setPage(p => p - 1)}
// //           className="bg-gray-200 text-gray-600 px-3 py-1 rounded disabled:opacity-50"
// //         >
// //           Previous
// //         </button>
// //         <span>Page {page} of {totalPages}</span>
// //         <button
// //           disabled={page >= totalPages}
// //           onClick={() => setPage(p => p + 1)}
// //           className="bg-gray-200 text-gray-600 px-3 py-1 rounded disabled:opacity-50"
// //         >
// //           Next
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // function CommentCard({
// //   comment,
// //   currentUserId,
// //   replyMap,
// //   setReplyMap,
// //   handleReply,
// //   handleLike,
// //   handleDelete,
// //   handleUpdate,
// //   token,
// //   openMenuId,
// //   toggleMenu,
// //   handleShare,
// //   handleReport,
// //   handleBlock,
// // }) {
// //   const menuRef = useRef(null);

// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (menuRef.current && !menuRef.current.contains(event.target)) {
// //         if (openMenuId === comment._id) toggleMenu(null);
// //       }
// //     };
// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, [openMenuId, comment._id]);

// //   return (
// //     <div id={`comment-${comment._id}`} className="border-b pb-4 relative">
// //       <div className="flex gap-3">
// //         <img
// //           src={comment.ownerDetails?.avatar || "/default-avatar.png"}
// //           className="w-8 h-8 rounded-full"
// //           alt="avatar"
// //         />
// //         <div className="flex-1">
// //           <p className="font-semibold">{comment.ownerDetails?.username}</p>
// //           <p className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
// //           <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>

// //           <div className="flex gap-3 text-sm mt-2 items-center">
// //             <button
// //               onClick={() => handleLike(comment._id)}
// //               className={`flex items-center gap-1 ${comment.isLikedByUser ? "text-blue-600 font-semibold" : "text-gray-600"}`}
// //               aria-label="Like comment"
// //             >
// //               ❤️ {comment.likesCount || 0}
// //             </button>

// //             <span className="text-gray-500">💬 {comment.replies?.length || 0} replies</span>

// //             {comment.ownerDetails?._id === currentUserId && (
// //               <>
// //                 <button
// //                   onClick={() => handleDelete(comment._id)}
// //                   className="text-red-500"
// //                   aria-label="Delete comment"
// //                 >
// //                   Delete
// //                 </button>
// //                 <button
// //                   onClick={() => handleUpdate(comment._id, comment.content)}
// //                   className="text-yellow-600"
// //                   aria-label="Edit comment"
// //                 >
// //                   Edit
// //                 </button>
// //               </>
// //             )}
// //           </div>

// //           {token && (
// //             <details className="mt-2 group">
// //               <summary className="cursor-pointer text-blue-600 text-sm">Reply</summary>
// //               <div className="mt-2 flex gap-2">
// //                 <input
// //                   type="text"
// //                   value={replyMap[comment._id] || ""}
// //                   onChange={(e) =>
// //                     setReplyMap((prev) => ({ ...prev, [comment._id]: e.target.value }))
// //                   }
// //                   placeholder="Write a reply..."
// //                   className="flex-1 p-2 border rounded"
// //                 />
// //                 <button
// //                   onClick={() => handleReply(comment._id)}
// //                   className="bg-blue-600 text-white px-3 rounded disabled:opacity-50"
// //                   disabled={!replyMap[comment._id]?.trim()}
// //                 >
// //                   Reply
// //                 </button>
// //               </div>
// //             </details>
// //           )}
// //         </div>

// //         {/* Side menu toggle */}
// //         <div className="relative" ref={menuRef}>
// //           <button
// //             onClick={() => toggleMenu(comment._id)}
// //             className="p-1 rounded hover:bg-gray-200"
// //             aria-label="Open comment menu"
// //           >
// //             <svg
// //               className="w-5 h-5 text-gray-600"
// //               fill="currentColor"
// //               viewBox="0 0 20 20"
// //               xmlns="http://www.w3.org/2000/svg"
// //             >
// //               <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
// //             </svg>
// //           </button>

// //           {openMenuId === comment._id && (
// //             <div className="absolute right-0 top-6 bg-white border rounded shadow-md z-10 w-32 text-sm">
// //               {comment.ownerDetails?._id === currentUserId && (
// //                 <button
// //                   onClick={() => {
// //                     toggleMenu(null);
// //                     handleDelete(comment._id);
// //                   }}
// //                   className="block w-full text-left px-3 py-2 hover:bg-red-100 text-red-600"
// //                 >
// //                   Delete
// //                 </button>
// //               )}
// //               <button
// //                 onClick={() => {
// //                   toggleMenu(null);
// //                   handleShare(comment);
// //                 }}
// //                 className="block w-full text-left px-3 py-2 hover:bg-gray-100"
// //               >
// //                 Share
// //               </button>
// //               <button
// //                 onClick={() => {
// //                   toggleMenu(null);
// //                   handleReport(comment._id);
// //                 }}
// //                 className="block w-full text-left px-3 py-2 hover:bg-gray-100"
// //               >
// //                 Report
// //               </button>
// //               <button
// //                 onClick={() => {
// //                   toggleMenu(null);
// //                   handleBlock(comment.ownerDetails?.username, comment.ownerDetails?._id);
// //                 }}
// //                 className="block w-full text-left px-3 py-2 hover:bg-gray-100"
// //               >
// //                 Block User
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Render Replies recursively */}
// //       {comment.replies?.length > 0 && (
// //         <div className="ml-10 mt-4 space-y-4">
// //           {comment.replies.map((reply) => (
// //             <CommentCard
// //               key={reply._id}
// //               comment={reply}
// //               currentUserId={currentUserId}
// //               replyMap={replyMap}
// //               setReplyMap={setReplyMap}
// //               handleReply={handleReply}
// //               handleLike={handleLike}
// //               handleDelete={handleDelete}
// //               handleUpdate={handleUpdate}
// //               token={token}
// //               openMenuId={openMenuId}
// //               toggleMenu={toggleMenu}
// //               handleShare={handleShare}
// //               handleReport={handleReport}
// //               handleBlock={handleBlock}
// //             />
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }


// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useForm } from "react-hook-form";
// import { toast, Toaster } from "react-hot-toast";
// import { jwtDecode } from "jwt-decode";
// import { motion, AnimatePresence } from "framer-motion";
// import { FiHeart, FiMessageSquare, FiShare2, FiMoreVertical, FiEdit2, FiTrash2, FiFlag } from "react-icons/fi";
// import API from "../../../utils/axiosInstance.jsx";

// export default function CommentSection({ videoId }) {
//   const [comments, setComments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [replyMap, setReplyMap] = useState({});
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [expandedReplies, setExpandedReplies] = useState({});

//   const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

//   const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
//   const contentValue = watch("content");

//   let currentUserId = null;
//   if (token) {
//     try {
//       const decoded = jwtDecode(token);
//       currentUserId = decoded?.id || decoded?.userId || null;
//     } catch (e) {
//       console.error("Invalid token", e);
//     }
//   }

//   useEffect(() => {
//     if (videoId) fetchComments(page);
//   }, [videoId, page]);

//   const fetchComments = async (pageNumber = 1) => {
//     setLoading(true);
//     try {
//       const res = await API.get(`/users/comments/${videoId}?page=${pageNumber}&limit=10`);
//       setComments(res?.data?.data?.comments || []);
//       setTotalPages(res?.data?.data?.totalPages || 1);
//     } catch (error) {
//       toast.error("Failed to fetch comments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onSubmit = async (data) => {
//     const content = data.content?.trim();
//     if (!token) return toast.error("Please login to comment");
//     if (!content) return toast.error("Comment cannot be empty");

//     try {
//       const res = await API.post(
//         `/users/comments/${videoId}`,
//         { content },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const newComment = res?.data?.data;
//       setComments(prev => [{ ...newComment, replies: [] }, ...prev]);
//       reset();
//       toast.success("Comment posted!");
//     } catch {
//       console.error("Failed to post comment");
//       toast.error("login to comment");
//     }
//   };

//   const handleReply = async (parentId) => {
//     const replyContent = replyMap[parentId]?.trim();
//     if (!token) return toast.error("Please login to reply");
//     if (!replyContent) return toast.error("Reply cannot be empty");

//     try {
//       const res = await API.post(
//         `/users/comments/${parentId}/reply`,
//         { content: replyContent, video: videoId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const newReply = res?.data?.data;

//       const updateReplies = (list) =>
//         list.map(comment => {
//           if (comment._id === parentId) {
//             return { ...comment, replies: [...(comment.replies || []), newReply] };
//           }
//           return { ...comment, replies: updateReplies(comment.replies || []) };
//         });

//       setComments(prev => updateReplies(prev));
//       toast.success("Reply added");
//     } catch {
//       toast.error("Failed to add reply");
//     } finally {
//       setReplyMap(prev => ({ ...prev, [parentId]: "" }));
//     }
//   };

//   const handleLike = async (commentId) => {
//     if (!token) return toast.error("Please login to like comments");

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
//       await API.post(`/users/comments/${commentId}/like`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//     } catch {
//       toast.error("Failed to update like");
//       fetchComments(page);
//     }
//   };

//   const handleDelete = async (commentId) => {
//     if (!token || !window.confirm("Are you sure you want to delete this comment?")) return;

//     const deleteRecursive = (list) =>
//       list
//         .filter(comment => comment._id !== commentId)
//         .map(comment => ({
//           ...comment,
//           replies: deleteRecursive(comment.replies || []),
//         }));

//     setComments(prev => deleteRecursive(prev));

//     try {
//       await API.delete(`/users/comments/${commentId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Comment deleted");
//     } catch {
//       toast.error("Failed to delete comment");
//       fetchComments(page);
//     }
//   };

//   const handleUpdate = async (commentId, oldContent) => {
//     const newContent = prompt("Edit your comment:", oldContent)?.trim();
//     if (!token) return toast.error("Please login to edit comments");
//     if (!newContent || newContent === oldContent) return;

//     const updateContent = (list) =>
//       list.map(comment => {
//         if (comment._id === commentId) {
//           return { ...comment, content: newContent };
//         }
//         return {
//           ...comment,
//           replies: updateContent(comment.replies || []),
//         };
//       });

//     setComments(prev => updateContent(prev));

//     try {
//       await API.put(`/users/comments/${commentId}`, {
//         content: newContent,
//       }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Comment updated");
//     } catch {
//       toast.error("Failed to update comment");
//       fetchComments(page);
//     }
//   };

//   const toggleMenu = (id) => {
//     setOpenMenuId(openMenuId === id ? null : id);
//   };

//   const handleShare = (comment) => {
//     navigator.clipboard.writeText(window.location.href + `#comment-${comment._id}`);
//     toast.success("Comment link copied!");
//     setOpenMenuId(null);
//   };

//   const handleReport = async (commentId) => {
//     try {
//       await API.post(`/users/comments/${commentId}/report`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Report submitted!");
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Report failed");
//     }
//   };

//   const handleBlock = async (username, userId) => {
//     try {
//       await API.post(`/users/block/${userId}`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success(`${username} has been blocked.`);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Block failed");
//     }
//   };

//   const toggleReplies = (commentId) => {
//     setExpandedReplies(prev => ({
//       ...prev,
//       [commentId]: !prev[commentId]
//     }));
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-4 md:p-6">
//       <Toaster position="top-right" />
//       <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800">Comments</h2>

//       {/* Add Comment Input */}
//       <motion.form 
//         onSubmit={handleSubmit(onSubmit)}
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col gap-3 mb-6"
//       >
//         <div className="flex gap-3">
//           <img
//             src={token ? (currentUserId?.avatar || "/default-avatar.png") : "/default-avatar.png"}
//             className="w-10 h-10 rounded-full object-cover flex-shrink-0"
//             alt="User avatar"
//           />
//           <div className="flex-1">
//             <textarea
//               {...register("content", { required: true })}
//               placeholder={token ? "Add a comment..." : "Please login to comment"}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//               rows="3"
//               disabled={!token}
//             />
//             {errors.content && <p className="text-red-500 text-sm mt-1">Comment is required</p>}
//           </div>
//         </div>
//         <div className="flex justify-end">
//           <button
//             type="submit"
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//             disabled={!contentValue?.trim() || !token}
//           >
//             Post Comment
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
//           className="text-center py-10 text-black-500 bg-gray-500 rounded-lg"
//         >
//           No comments yet. Be the first to comment!
//         </motion.div>
//       ) : (
//         <div className="space-y-4">
//           {comments.map(comment => (
//             <CommentCard
//               key={comment._id}
//               comment={comment}
//               currentUserId={currentUserId}
//               replyMap={replyMap}
//               setReplyMap={setReplyMap}
//               handleReply={handleReply}
//               handleLike={handleLike}
//               handleDelete={handleDelete}
//               handleUpdate={handleUpdate}
//               token={token}
//               openMenuId={openMenuId}
//               toggleMenu={toggleMenu}
//               handleShare={handleShare}
//               handleReport={handleReport}
//               handleBlock={handleBlock}
//               toggleReplies={toggleReplies}
//               expandedReplies={expandedReplies}
//             />
//           ))}
//         </div>
//       )}

//       {/* Pagination Controls */}
//       {totalPages > 1 && (
//         <div className="flex justify-center items-center gap-4 mt-8">
//           <button
//             disabled={page <= 1}
//             onClick={() => setPage(p => p - 1)}
//             className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
//           >
//             Previous
//           </button>
//           <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
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
//   currentUserId,
//   replyMap,
//   setReplyMap,
//   handleReply,
//   handleLike,
//   handleDelete,
//   handleUpdate,
//   token,
//   openMenuId,
//   toggleMenu,
//   handleShare,
//   handleReport,
//   handleBlock,
//   toggleReplies,
//   expandedReplies,
// }) {
//   const menuRef = useRef(null);
//   const replyInputRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         if (openMenuId === comment._id) toggleMenu(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [openMenuId, comment._id]);

//   const showReplies = expandedReplies[comment._id] ?? true;

//   return (
//     <motion.div 
//       id={`comment-${comment._id}`}
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.2 }}
//       className="bg-gray-300 rounded-lg p-4 hover:bg-gray-400 transition-colors relative"
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
//               <span className="font-semibold text-gray-800">{comment.ownerDetails?.username}</span>
//               <span className="text-xs text-gray-500 ml-2">
//                 {new Date(comment.createdAt).toLocaleString()}
//               </span>
//             </div>
            
//             {/* Side menu toggle */}
//             <div className="relative" ref={menuRef}>
//               <button
//                 onClick={() => toggleMenu(comment._id)}
//                 className="p-1 rounded-full hover:bg-gray-800 transition-colors"
//                 aria-label="Comment options"
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
//                     {comment.ownerDetails?._id === currentUserId && (
//                       <>
//                         <button
//                           onClick={() => {
//                             toggleMenu(null);
//                             handleUpdate(comment._id, comment.content);
//                           }}
//                           className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                           <FiEdit2 className="mr-2" /> Edit
//                         </button>
//                         <button
//                           onClick={() => {
//                             toggleMenu(null);
//                             handleDelete(comment._id);
//                           }}
//                           className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
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
//                     <button
//                       onClick={() => {
//                         toggleMenu(null);
//                         handleReport(comment._id);
//                       }}
//                       className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       <FiFlag className="mr-2" /> Report
//                     </button>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>

//           <p className="text-gray-700 whitespace-pre-wrap break-words mb-3">{comment.content}</p>

//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => handleLike(comment._id)}
//               className={`flex items-center gap-1 text-sm ${comment.isLikedByUser ? "text-red-500 font-medium" : "text-gray-500"}`}
//               aria-label={comment.isLikedByUser ? "Unlike comment" : "Like comment"}
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
//             >
//               <FiMessageSquare />
//               <span>{comment.replies?.length || 0} replies</span>
//             </button>

//             {token && (
//               <button
//                 onClick={() => {
//                   toggleReplies(comment._id);
//                   if (replyInputRef.current) {
//                     replyInputRef.current.focus();
//                   }
//                 }}
//                 className="text-sm text-blue-500 hover:text-blue-700"
//               >
//                 Reply
//               </button>
//             )}
//           </div>

//           {token && (
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
//                   className="flex-1 px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-800 hover:border-blue-800 transition-colors"
//                 />
//                 <button
//                   onClick={() => handleReply(comment._id)}
//                   className="px-3 py-2 text-sm bg-blue-500 text-black-800 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//                   disabled={!replyMap[comment._id]?.trim()}
//                 >
//                   Post
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>

//       {/* Replies section */}
//       {comment.replies?.length > 0 && (
//         <div className={`mt-4 pl-4 border-l-2 border-gray-200 ${!showReplies ? 'hidden' : ''}`}>
//           <AnimatePresence>
//             {showReplies && comment.replies.map((reply) => (
//               <motion.div
//                 key={reply._id}
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -10 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 <CommentCard
//                   comment={reply}
//                   currentUserId={currentUserId}
//                   replyMap={replyMap}
//                   setReplyMap={setReplyMap}
//                   handleReply={handleReply}
//                   handleLike={handleLike}
//                   handleDelete={handleDelete}
//                   handleUpdate={handleUpdate}
//                   token={token}
//                   openMenuId={openMenuId}
//                   toggleMenu={toggleMenu}
//                   handleShare={handleShare}
//                   handleReport={handleReport}
//                   handleBlock={handleBlock}
//                   toggleReplies={toggleReplies}
//                   expandedReplies={expandedReplies}
//                 />
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>
//       )}
//     </motion.div>
//   );
// }


// src/components/CommentSection.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
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


export default function CommentSection({ videoId }) {
  // State management
  const [comments, setComments] = useState([]); // Array of comments
  const [loading, setLoading] = useState(false); // Loading state
  const [replyMap, setReplyMap] = useState({}); // Map of reply inputs
  const [page, setPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(1); // Total pages available
  const [openMenuId, setOpenMenuId] = useState(null); // ID of comment with open menu
  const [expandedReplies, setExpandedReplies] = useState({}); // Map of expanded replies

  // Get token from localStorage (client-side only)
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // Form handling
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors }, 
    watch 
  } = useForm();
  const contentValue = watch("content"); // Watch comment input value

  // Get current user ID from token
  let currentUserId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUserId = decoded?.id || decoded?.userId || null;
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

  // Fetch comments when videoId or page changes
  useEffect(() => {
    if (videoId) fetchComments(page);
  }, [videoId, page]);

  /**
   * Fetches comments for the current video
   * @param {number} pageNumber - Page number to fetch (default: 1)
   */
  const fetchComments = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/users/comments/${videoId}?page=${pageNumber}&limit=10`
      );
      setComments(res?.data?.data?.comments || []);
      setTotalPages(res?.data?.data?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles comment submission
   * @param {Object} data - Form data containing comment content
   */
  const onSubmit = async (data) => {
    const content = data.content?.trim();
    // Validation
    if (!token) return toast.error("Please login to comment");
    if (!content) return toast.error("Comment cannot be empty");

    try {
      const res = await API.post(
        `/users/comments/${videoId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add new comment to top of list
      const newComment = res?.data?.data;
      setComments(prev => [{ ...newComment, replies: [] }, ...prev]);
      reset(); // Clear form
      toast.success("Comment posted!");
    } catch {
      console.error("Failed to post comment");
      toast.error("login to comment");
    }
  };

  /**
   * Handles reply to a comment
   * @param {string} parentId - ID of the parent comment
   */
  const handleReply = async (parentId) => {
    const replyContent = replyMap[parentId]?.trim();
    // Validation
    if (!token) return toast.error("Please login to reply");
    if (!replyContent) return toast.error("Reply cannot be empty");

    try {
      const res = await API.post(
        `/users/comments/${parentId}/reply`,
        { content: replyContent, video: videoId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update comments with new reply
      const newReply = res?.data?.data;
      const updateReplies = (list) =>
        list.map(comment => {
          if (comment._id === parentId) {
            return { ...comment, replies: [...(comment.replies || []), newReply] };
          }
          return { ...comment, replies: updateReplies(comment.replies || []) };
        });

      setComments(prev => updateReplies(prev));
      toast.success("Reply added");
    } catch {
      toast.error("Failed to add reply");
    } finally {
      // Clear reply input
      setReplyMap(prev => ({ ...prev, [parentId]: "" }));
    }
  };

  /**
   * Handles liking/unliking a comment
   * @param {string} commentId - ID of the comment to like/unlike
   */
  const handleLike = async (commentId) => {
    if (!token) return toast.error("Please login to like comments");

    // Optimistic UI update
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

    // API call
    try {
      await API.post(
        `/users/comments/${commentId}/like`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      toast.error("Failed to update like");
      fetchComments(page); // Revert on failure
    }
  };

  /**
   * Handles comment deletion
   * @param {string} commentId - ID of the comment to delete
   */
  const handleDelete = async (commentId) => {
    if (!token || !window.confirm("Are you sure you want to delete this comment?")) return;

    // Optimistic UI update
    const deleteRecursive = (list) =>
      list
        .filter(comment => comment._id !== commentId)
        .map(comment => ({
          ...comment,
          replies: deleteRecursive(comment.replies || []),
        }));

    setComments(prev => deleteRecursive(prev));

    // API call
    try {
      await API.delete(`/users/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
      fetchComments(page); // Revert on failure
    }
  };

  /**
   * Handles comment editing
   * @param {string} commentId - ID of the comment to edit
   * @param {string} oldContent - Current content of the comment
   */
  const handleUpdate = async (commentId, oldContent) => {
    const newContent = prompt("Edit your comment:", oldContent)?.trim();
    // Validation
    if (!token) return toast.error("Please login to edit comments");
    if (!newContent || newContent === oldContent) return;

    // Optimistic UI update
    const updateContent = (list) =>
      list.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, content: newContent };
        }
        return {
          ...comment,
          replies: updateContent(comment.replies || []),
        };
      });

    setComments(prev => updateContent(prev));

    // API call
    try {
      await API.put(
        `/users/comments/${commentId}`,
        { content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
      fetchComments(page); // Revert on failure
    }
  };

  /**
   * Toggles the comment menu
   * @param {string} id - ID of the comment to toggle menu for
   */
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  /**
   * Copies comment link to clipboard
   * @param {Object} comment - Comment object
   */
  const handleShare = (comment) => {
    navigator.clipboard.writeText(
      `${window.location.href}#comment-${comment._id}`
    );
    toast.success("Comment link copied!");
    setOpenMenuId(null);
  };

  /**
   * Reports a comment
   * @param {string} commentId - ID of the comment to report
   */
  const handleReport = async (commentId) => {
    try {
      await API.post(
        `/users/comments/${commentId}/report`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Report submitted!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Report failed");
    }
  };

  /**
   * Toggles replies visibility for a comment
   * @param {string} commentId - ID of the comment
   */
  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Toaster position="top-right" />
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800">
        Comments
      </h2>

      {/* Comment input form */}
      <motion.form 
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 mb-6"
      >
        <div className="flex gap-3">
          <img
            src={token ? (currentUserId?.avatar || "/default-avatar.png") : "/default-avatar.png"}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            alt="User avatar"
          />
          <div className="flex-1">
            <textarea
              {...register("content", { required: true })}
              placeholder={token ? "Add a comment..." : "Please login to comment"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              disabled={!token}
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
            disabled={!contentValue?.trim() || !token}
          >
            Post Comment
          </button>
        </div>
      </motion.form>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center py-10">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 text-black-500 bg-gray-500 rounded-lg"
        >
          No comments yet. Be the first to comment!
        </motion.div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentCard
              key={comment._id}
              comment={comment}
              currentUserId={currentUserId}
              replyMap={replyMap}
              setReplyMap={setReplyMap}
              handleReply={handleReply}
              handleLike={handleLike}
              handleDelete={handleDelete}
              handleUpdate={handleUpdate}
              token={token}
              openMenuId={openMenuId}
              toggleMenu={toggleMenu}
              handleShare={handleShare}
              handleReport={handleReport}
              toggleReplies={toggleReplies}
              expandedReplies={expandedReplies}
            />
          ))}
        </div>
      )}

      {/* Pagination controls */}
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

/**
 * CommentCard component for rendering individual comments
 * @param {Object} props - Component props
 * @param {Object} props.comment - Comment data
 * @param {string|null} props.currentUserId - Current user's ID
 * @param {Object} props.replyMap - Map of reply inputs
 * @param {Function} props.setReplyMap - Setter for replyMap
 * @param {Function} props.handleReply - Handler for reply submission
 * @param {Function} props.handleLike - Handler for like action
 * @param {Function} props.handleDelete - Handler for delete action
 * @param {Function} props.handleUpdate - Handler for update action
 * @param {string|null} props.token - Authentication token
 * @param {string|null} props.openMenuId - ID of open comment menu
 * @param {Function} props.toggleMenu - Handler for toggling menu
 * @param {Function} props.handleShare - Handler for share action
 * @param {Function} props.handleReport - Handler for report action
 * @param {Function} props.toggleReplies - Handler for toggling replies
 * @param {Object} props.expandedReplies - Map of expanded replies state
 */
function CommentCard({
  comment,
  currentUserId,
  replyMap,
  setReplyMap,
  handleReply,
  handleLike,
  handleDelete,
  handleUpdate,
  token,
  openMenuId,
  toggleMenu,
  handleShare,
  handleReport,
  toggleReplies,
  expandedReplies,
}) {
  const menuRef = useRef(null);
  const replyInputRef = useRef(null);
  const showReplies = expandedReplies[comment._id] ?? true;

  // Close menu when clicking outside
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
      className="bg-gray-300 rounded-lg p-4 hover:bg-gray-400 transition-colors relative"
    >
      <div className="flex gap-3 relative">
        {/* User avatar */}
        <img
          src={comment.ownerDetails?.avatar || "/default-avatar.png"}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          alt={`${comment.ownerDetails?.username}'s avatar`}
        />
        
        <div className="flex-1 min-w-0">
          {/* Comment header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <span className="font-semibold text-gray-800">
                {comment.ownerDetails?.username}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            
            {/* Comment menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => toggleMenu(comment._id)}
                className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Comment options"
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
                    {/* Owner actions */}
                    {comment.ownerDetails?._id === currentUserId && (
                      <>
                        <button
                          onClick={() => {
                            toggleMenu(null);
                            handleUpdate(comment._id, comment.content);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FiEdit2 className="mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            toggleMenu(null);
                            handleDelete(comment._id);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          <FiTrash2 className="mr-2" /> Delete
                        </button>
                      </>
                    )}
                    {/* General actions */}
                    <button
                      onClick={() => {
                        toggleMenu(null);
                        handleShare(comment);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiShare2 className="mr-2" /> Share
                    </button>
                    <button
                      onClick={() => {
                        toggleMenu(null);
                        handleReport(comment._id);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiFlag className="mr-2" /> Report
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Comment content */}
          <p className="text-gray-700 whitespace-pre-wrap break-words mb-3">
            {comment.content}
          </p>

          {/* Comment actions */}
          <div className="flex items-center gap-4">
            {/* Like button */}
            <button
              onClick={() => handleLike(comment._id)}
              className={`flex items-center gap-1 text-sm ${
                comment.isLikedByUser ? "text-red-500 font-medium" : "text-gray-500"
              }`}
              aria-label={comment.isLikedByUser ? "Unlike comment" : "Like comment"}
            >
              <FiHeart className={comment.isLikedByUser ? "fill-current" : ""} />
              <span>{comment.likesCount || 0}</span>
            </button>

            {/* Replies toggle */}
            <button
              onClick={() => {
                toggleReplies(comment._id);
                if (replyInputRef.current && !showReplies) {
                  replyInputRef.current.focus();
                }
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <FiMessageSquare />
              <span>{comment.replies?.length || 0} replies</span>
            </button>

            {/* Reply button */}
            {token && (
              <button
                onClick={() => {
                  toggleReplies(comment._id);
                  if (replyInputRef.current) {
                    replyInputRef.current.focus();
                  }
                }}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Reply
              </button>
            )}
          </div>

          {/* Reply input */}
          {token && (
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
                  className="flex-1 px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-800 hover:border-blue-800 transition-colors"
                />
                <button
                  onClick={() => handleReply(comment._id)}
                  className="px-3 py-2 text-sm bg-blue-500 text-black-800 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  disabled={!replyMap[comment._id]?.trim()}
                >
                  Post
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Replies section */}
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
                  currentUserId={currentUserId}
                  replyMap={replyMap}
                  setReplyMap={setReplyMap}
                  handleReply={handleReply}
                  handleLike={handleLike}
                  handleDelete={handleDelete}
                  handleUpdate={handleUpdate}
                  token={token}
                  openMenuId={openMenuId}
                  toggleMenu={toggleMenu}
                  handleShare={handleShare}
                  handleReport={handleReport}
                  toggleReplies={toggleReplies}
                  expandedReplies={expandedReplies}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}