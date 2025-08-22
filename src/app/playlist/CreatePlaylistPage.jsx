// /* eslint-disable no-unused-vars */

// "use client";
// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Trash2, Pencil, Loader2, Plus, ChevronRight, X, Video as VideoIcon } from "lucide-react";
// import toast from "react-hot-toast";
// import { motion, AnimatePresence } from "framer-motion";
// import CountUp from "react-countup";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "../components/ui/card.jsx";
// import { Button } from "../components/ui/button.jsx";
// import { Input } from "../components/ui/input.jsx";
// import Textarea from "../components/ui/textarea.jsx";
// import Label from "../components/ui/label.jsx";
// import API from "../../utils/axiosInstance.jsx";
// import "../../index.css";

// const CreatePlaylistPage = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   const [playlists, setPlaylists] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [formData, setFormData] = useState({ name: "", description: "" });
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [playlistVideos, setPlaylistVideos] = useState([]);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedVideos, setSelectedVideos] = useState([]);
//   const [availableVideos, setAvailableVideos] = useState([]);

//   const fetchPlaylists = async () => {
//     try {
//       setLoading(true);
//       const res = await API.get("/users/playlist");
//       const data = res.data.data;
//       setPlaylists(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Error fetching playlists:", err);
//       toast.error("Failed to load playlists.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPlaylistById = async () => {
//     try {
//       const res = await API.get(`/users/playlist/${id}`);
//       const playlist = res.data.data || {};
//       setFormData({
//         name: playlist.name || "",
//         description: playlist.description || "",
//       });
//       setIsEditMode(true);
//       if (playlist.videos && playlist.videos.length > 0) {
//         setPlaylistVideos(playlist.videos);
//         setSelectedVideos(playlist.videos.map(v => v._id));
//       }
//     } catch (err) {
//       console.error("Error loading playlist:", err);
//       toast.error("Could not load playlist.");
//       navigate("/playlists");
//     }
//   };

//   const fetchAvailableVideos = async () => {
//     try {
//       const res = await API.get("/users/videos");
//       const videos = res.data?.videos;
//       setAvailableVideos(Array.isArray(videos) ? videos : []);
//     } catch (err) {
//       console.error("Error fetching available videos:", err);
//       toast.error("Failed to load available videos");
//     }
//   };
  
//   useEffect(() => {
//     fetchPlaylists();
//     fetchAvailableVideos();
//   }, []);

//   useEffect(() => {
//     if (id) {
//       fetchPlaylistById();
//     } else {
//       setFormData({ name: "", description: "" });
//       setIsEditMode(false);
//       setPlaylistVideos([]);
//       setSelectedVideos([]);
//     }
//   }, [id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);

//     try {
//       const payload = {
//         ...formData,
//         videos: selectedVideos
//       };

//       if (isEditMode && id) {
//         await API.put(`/users/playlist/${id}`, payload);
//         toast.success("Playlist updated successfully!");
//         await fetchPlaylists();

//         // Update the specific playlist in state instead of refetching all
//         setPlaylists(prevPlaylists => 
//           prevPlaylists.map(playlist => 
//             playlist._id === id 
//               ? {...playlist, name: formData.name, description: formData.description}
//               : playlist
//           )
//         );
//       } else {
//         const res = await API.post("/users/playlist", payload);
//         const newPlaylist = res?.data?.data;
//         toast.success("Playlist created successfully!");
        
//         // Add the new playlist to state instead of refetching all
//         setPlaylists(prevPlaylists => [...prevPlaylists, newPlaylist]);
        
//         setShowCreateModal(false);
//         navigate(`/playlists/edit/${newPlaylist._id}`);
//       }
//     } catch (err) {
//       console.error("Error saving playlist:", err);
//       toast.error(err.response?.data?.message || "Failed to save playlist");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDeletePlaylist = async (playlistId) => {
//     try {
//       await API.delete(`/users/playlist/${playlistId}`);
//       toast.success("Playlist deleted successfully!");
      
//       // Remove the playlist from state instead of refetching all
//       setPlaylists(prevPlaylists => 
//         prevPlaylists.filter(playlist => playlist._id !== playlistId)
//       );
      
// if (id?.toString() === playlistId?.toString()) {
//   navigate("/playlists");
// }

//     } catch (err) {
//       console.error("Error deleting playlist:", err);
//       toast.error("Failed to delete playlist");
//     }
//   };

//   const handleViewPlaylist = (playlistId) => {
//     navigate(`/playlists/${playlistId}`);
//   };

//   const handleEditPlaylist = (playlistId) => {
//     navigate(`/playlists/edit/${playlistId}`);
//   };

//   const resetForm = () => {
//     setFormData({ name: "", description: "" });
//     setIsEditMode(false);
//     setSelectedVideos([]);
//     setSearchQuery("");
//   };

//   const toggleVideoSelection = (videoId) => {
//     setSelectedVideos(prev =>
//       prev.includes(videoId)
//         ? prev.filter(id => id !== videoId)
//         : [...prev, videoId]
//     );
//   };

//   const filteredVideos = Array.isArray(availableVideos)
//     ? availableVideos.filter(video =>
//         video.title?.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     : [];

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-7xl">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//           className="flex-1"
//         >
//           <h1 className="text-2xl md:text-3xl font-bold">
//             {isEditMode ? "Edit Playlist" : "Your Playlists"}
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             You have{" "}
//             <strong className="text-blue-600 dark:text-blue-400">
//               <CountUp end={playlists?.length || 0} duration={0.8} />
//             </strong>{" "}
//            {`playlist${(playlists?.length || 0) !== 1 ? "s" : ""}`}

//           </p>
//         </motion.div>
        
//         <motion.div
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//         >
//           <Button 
//             onClick={() => {
//               resetForm();
//               setShowCreateModal(true);
//             }}
//             className="flex items-center gap-2 w-full md:w-auto"
//             aria-label="Create new playlist"
//           >
//             <Plus size={18} />
//             Create Playlist
//           </Button>
//         </motion.div>
//       </div>

//       {/* Create Playlist Modal */}
//       <AnimatePresence>
//         {showCreateModal && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
//             onClick={() => setShowCreateModal(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//               className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
//               onClick={(e) => e.stopPropagation()}
//               role="dialog"
//               aria-modal="true"
//               aria-labelledby="modal-title"
//             >
//               <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
//                 <h2 id="modal-title" className="text-xl font-bold">Create New Playlist</h2>
//                 <button 
//                   onClick={() => setShowCreateModal(false)}
//                   className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//                   aria-label="Close modal"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
              
//               {/* <div className="overflow-y-auto flex-1 p-4">
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="modal-name">Playlist Name</Label>
//                     <Input
//                       id="modal-name"
//                       name="name"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       placeholder="My Awesome Playlist"
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="modal-description">Description</Label>
//                     <Textarea
//                       id="modal-description"
//                       name="description"
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       placeholder="Describe your playlist"
//                       required
//                       rows={3}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Add Videos</Label>
//                     <Input
//                       placeholder="Search videos..."
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="mb-3"
//                     />
                    
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
//                       {filteredVideos.length > 0 ? (
//                         filteredVideos.map((video) => (
//                           <motion.div
//                             key={video._id}
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => toggleVideoSelection(video._id)}
//                             className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
//                               selectedVideos.includes(video._id)
//                                 ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
//                                 : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
//                             }`}
//                             role="checkbox"
//                             aria-checked={selectedVideos.includes(video._id)}
//                             tabIndex="0"
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter' || e.key === ' ') {
//                                 toggleVideoSelection(video._id);
//                               }
//                             }}
//                           >
//                             <div className={`flex-shrink-0 w-10 h-10 rounded flex items-center justify-center ${
//                               selectedVideos.includes(video._id)
//                                 ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
//                                 : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
//                             }`}>
//                               <VideoIcon size={16} />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p className="text-sm font-medium truncate">
//                                 {video.title || "Untitled Video"}
//                               </p>
//                               <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                                 {video.duration || "0:00"}
//                               </p>
//                             </div>
//                             {selectedVideos.includes(video._id) && (
//                               <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
//                                 <span className="text-xs">✓</span>
//                               </div>
//                             )}
//                           </motion.div>
//                         ))
//                       ) : (
//                         <div className="col-span-2 text-center py-4 text-gray-500 dark:text-gray-400">
//                           No videos found
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </form>
//               </div> */}

//               <div className="p-4 border-t dark:border-gray-700">
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setShowCreateModal(false)}
//                     disabled={saving}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     onClick={handleSubmit}
//                     disabled={saving}
//                   >
//                     {saving ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Creating...
//                       </>
//                     ) : (
//                       "Create Playlist"
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main Content */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Edit Form (only shown when editing) */}
//         {isEditMode && (
//           <div className="lg:col-span-1 order-2 lg:order-1">
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-xl">Edit Playlist</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="edit-name">Playlist Name</Label>
//                       <Input
//                         id="edit-name"
//                         name="name"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         placeholder="My Awesome Playlist"
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="edit-description">Description</Label>
//                       <Textarea
//                         id="edit-description"
//                         name="description"
//                         value={formData.description}
//                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                         placeholder="Describe your playlist"
//                         required
//                         rows={3}
//                       />
//                     </div>
//                     <Button
//                       type="submit"
//                       disabled={saving}
//                       className="w-full"
//                     >
//                       {saving ? (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           Saving...
//                         </>
//                       ) : (
//                         "Save Changes"
//                       )}
//                     </Button>
//                   </form>
//                 </CardContent>
//               </Card>

//               {playlistVideos.length > 0 && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.1 }}
//                   className="mt-6"
//                 >
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-xl">Current Videos</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       {playlistVideos.map((video) => (
//                         <motion.div
//                           key={video._id}
//                           whileHover={{ x: 5 }}
//                           className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
//                               <VideoIcon size={16} className="text-gray-500 dark:text-gray-400" />
//                             </div>
//                             <span className="truncate text-sm font-medium">
//                               {video.title || "Untitled Video"}
//                             </span>
//                           </div>
//                           <Button 
//                             variant="ghost" 
//                             size="sm"
//                             onClick={() => navigate(`/video/${video.videoId}`)}
//                             className="text-blue-600 dark:text-blue-400"
//                           >
//                             View
//                           </Button>
//                         </motion.div>
//                       ))}
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               )}
//             </motion.div>
//           </div>
//         )}

//         {/* Playlists List */}
//         <div className={isEditMode ? "lg:col-span-2 order-1 lg:order-2" : "lg:col-span-3"}>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.3 }}
//           >
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-xl">Your Playlists</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {playlists.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
//                       <Plus className="h-8 w-8 text-gray-400" />
//                     </div>
//                     <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       No playlists yet
//                     </h3>
//                     <p className="text-gray-500 dark:text-gray-400 mb-4">
//                       Get started by creating your first playlist
//                     </p>
//                     <Button
//                       onClick={() => setShowCreateModal(true)}
//                       className="bg-blue-600 hover:bg-blue-700 text-white"
//                     >
//                       Create Playlist
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {playlists.map((playlist) => (
//                       <motion.div
//                         key={playlist._id}
//                         whileHover={{ y: -5 }}
//                         whileTap={{ scale: 0.98 }}
//                         transition={{ type: "spring", stiffness: 400 }}
//                         className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col"
//                       >
//                         <div className="p-5 flex-1">
//                           <div className="flex justify-between items-start">
//                             <div className="flex-1 min-w-0">
//                               <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 truncate">
//                                 {playlist.name}
//                               </h3>
//                               <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
//                                 {playlist.description || "No description"}
//                               </p>
//                             </div>
//                             <div className="flex space-x-2">
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
//                                 onClick={() => handleEditPlaylist(playlist._id)}
//                                 aria-label={`Edit playlist ${playlist.name}`}
//                               >
//                                 <Pencil className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
//                                 onClick={() => handleDeletePlaylist(playlist._id)}
//                                 aria-label={`Delete playlist ${playlist.name}`}
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div className="px-5 pb-4">
//                           <div className="flex items-center justify-between">
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
//                               {playlist?.videos?.length ?? 0} video{playlist?.videos?.length !== 1 ? 's' : ''}
//                             </span>
//                             <Button
//                               variant="link"
//                               className="text-blue-600 dark:text-blue-400 p-0 h-auto"
//                               onClick={() => handleViewPlaylist(playlist._id)}
//                             >
//                               View Details <ChevronRight className="h-4 w-4 ml-1" />
//                             </Button>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreatePlaylistPage;


/* eslint-disable no-unused-vars */

"use client";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, Pencil, Loader2, Plus, ChevronRight, X, Video as VideoIcon } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import Textarea from "../components/ui/textarea.jsx";
import Label from "../components/ui/label.jsx";
import API from "../../utils/axiosInstance.jsx";
import "../../index.css";

const CreatePlaylistPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [availableVideos, setAvailableVideos] = useState([]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users/playlist");
      const data = res.data.data;
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      toast.error("Failed to load playlists.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistById = async () => {
    try {
      const res = await API.get(`/users/playlist/${id}`);
      const playlist = res.data.data || {};
      setFormData({
        name: playlist.name || "",
        description: playlist.description || "",
      });
      setIsEditMode(true);
      if (playlist.videos && playlist.videos.length > 0) {
        setPlaylistVideos(playlist.videos);
        setSelectedVideos(playlist.videos.map(v => v.videoRef?._id || v._id));
      }
    } catch (err) {
      console.error("Error loading playlist:", err);
      toast.error("Could not load playlist.");
      navigate("/playlists");
    }
  };

  const fetchAvailableVideos = async () => {
    try {
      const res = await API.get("/users/videos"); // This endpoint needs to be created in backend
      const videos = res.data?.data || []; // Updated to match ApiResponse format
      setAvailableVideos(Array.isArray(videos) ? videos : []);
    } catch (err) {
      console.error("Error fetching available videos:", err);
      toast.error("Failed to load available videos");
    }
  };
  
  useEffect(() => {
    fetchPlaylists();
    fetchAvailableVideos();
  }, []);

  useEffect(() => {
    if (id) {
      fetchPlaylistById();
    } else {
      setFormData({ name: "", description: "" });
      setIsEditMode(false);
      setPlaylistVideos([]);
      setSelectedVideos([]);
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        videos: selectedVideos
      };

      if (isEditMode && id) {
        await API.put(`/users/playlist/${id}`, payload);
        toast.success("Playlist updated successfully!");
        
        // Update the specific playlist in state
        setPlaylists(prevPlaylists => 
          prevPlaylists.map(playlist => 
            playlist._id === id 
              ? {...playlist, ...formData, videos: playlistVideos}
              : playlist
          )
        );
      } else {
        const res = await API.post("/users/playlist", payload);
        const newPlaylist = res?.data?.data;
        toast.success("Playlist created successfully!");
        
        // Add the new playlist to state
        setPlaylists(prevPlaylists => [...prevPlaylists, newPlaylist]);
        
        setShowCreateModal(false);
        navigate(`/playlists/edit/${newPlaylist._id}`);
      }
    } catch (err) {
      console.error("Error saving playlist:", err);
      toast.error(err.response?.data?.message || "Failed to save playlist");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await API.delete(`/users/playlist/${playlistId}`);
      toast.success("Playlist deleted successfully!");
      
      // Remove the playlist from state
      setPlaylists(prevPlaylists => 
        prevPlaylists.filter(playlist => playlist._id !== playlistId)
      );
      
      if (id?.toString() === playlistId?.toString()) {
        navigate("/playlists");
      }
    } catch (err) {
      console.error("Error deleting playlist:", err);
      toast.error("Failed to delete playlist");
    }
  };

  const handleViewPlaylist = (playlistId) => {
    navigate(`/playlists/${playlistId}`);
  };

  const handleEditPlaylist = (playlistId) => {
    navigate(`/playlists/edit/${playlistId}`);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setIsEditMode(false);
    setSelectedVideos([]);
    setSearchQuery("");
  };

  const toggleVideoSelection = (videoId) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const filteredVideos = Array.isArray(availableVideos)
    ? availableVideos.filter(video =>
        video.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <h1 className="text-2xl md:text-3xl font-bold">
            {isEditMode ? "Edit Playlist" : "Your Playlists"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You have{" "}
            <strong className="text-blue-600 dark:text-blue-400">
              <CountUp end={playlists?.length || 0} duration={0.8} />
            </strong>{" "}
            {`playlist${(playlists?.length || 0) !== 1 ? "s" : ""}`}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 w-full md:w-auto"
            aria-label="Create new playlist"
          >
            <Plus size={18} />
            Create Playlist
          </Button>
        </motion.div>
      </div>

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h2 id="modal-title" className="text-xl font-bold">Create New Playlist</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-name">Playlist Name</Label>
                    <Input
                      id="modal-name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My Awesome Playlist"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-description">Description</Label>
                    <Textarea
                      id="modal-description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your playlist"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Add Videos</Label>
                    <Input
                      placeholder="Search videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-3"
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                      {filteredVideos.length > 0 ? (
                        filteredVideos.map((video) => (
                          <motion.div
                            key={video._id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleVideoSelection(video._id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedVideos.includes(video._id)
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                            role="checkbox"
                            aria-checked={selectedVideos.includes(video._id)}
                            tabIndex="0"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                toggleVideoSelection(video._id);
                              }
                            }}
                          >
                            <div className={`flex-shrink-0 w-10 h-10 rounded flex items-center justify-center ${
                              selectedVideos.includes(video._id)
                                ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            }`}>
                              <VideoIcon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {video.title || "Untitled Video"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {video.duration || "0:00"}
                              </p>
                            </div>
                            {selectedVideos.includes(video._id) && (
                              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                <span className="text-xs">✓</span>
                              </div>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-4 text-gray-500 dark:text-gray-400">
                          No videos found
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving || !formData.name}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Playlist"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form (only shown when editing) */}
        {isEditMode && (
          <div className="lg:col-span-1 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Edit Playlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Playlist Name</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="My Awesome Playlist"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your playlist"
                        rows={3}
                      />
                    </div>
                    
                    {/* Video selection in edit mode */}
                    <div className="space-y-2">
                      <Label>Select Videos</Label>
                      <Input
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-3"
                      />
                      
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                        {filteredVideos.map((video) => (
                          <div
                            key={video._id}
                            onClick={() => toggleVideoSelection(video._id)}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                              selectedVideos.includes(video._id)
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                : "border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedVideos.includes(video._id)}
                              onChange={() => {}}
                              className="rounded"
                            />
                            <span className="text-sm truncate">{video.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {playlistVideos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Current Videos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {playlistVideos.map((video) => (
                        <motion.div
                          key={video._id}
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                              <VideoIcon size={16} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <span className="truncate text-sm font-medium">
                              {video.title || video.videoRef?.title || "Untitled Video"}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/video/${video.videoRef?._id || video._id}`)}
                            className="text-blue-600 dark:text-blue-400"
                          >
                            View
                          </Button>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}

        {/* Playlists List */}
        <div className={isEditMode ? "lg:col-span-2 order-1 lg:order-2" : "lg:col-span-3"}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Your Playlists</CardTitle>
              </CardHeader>
              <CardContent>
                {playlists.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No playlists yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Get started by creating your first playlist
                    </p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Create Playlist
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.map((playlist) => (
                      <motion.div
                        key={playlist._id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col"
                      >
                        <div className="p-5 flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 truncate">
                                {playlist.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                                {playlist.description || "No description"}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                                onClick={() => handleEditPlaylist(playlist._id)}
                                aria-label={`Edit playlist ${playlist.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                onClick={() => handleDeletePlaylist(playlist._id)}
                                aria-label={`Delete playlist ${playlist.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-5 pb-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {playlist?.videos?.length ?? 0} video{playlist?.videos?.length !== 1 ? 's' : ''}
                            </span>
                            <Button
                              variant="link"
                              className="text-blue-600 dark:text-blue-400 p-0 h-auto"
                              onClick={() => handleViewPlaylist(playlist._id)}
                            >
                              View Details <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistPage;