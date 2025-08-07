// /* eslint-disable no-unused-vars */


// "use client";
// import React, { useRef, useState } from "react";
// import { motion } from "framer-motion";
// import { toast } from "sonner";
// import { Loader2, UploadCloud, User, X } from "lucide-react";
// import API from "../../../utils/axiosInstance";

// const sizeClasses = {
//   sm: {
//     container: "w-20 h-20",
//     icon: "w-5 h-5"
//   },
//   md: {
//     container: "w-32 h-32",
//     icon: "w-6 h-6"
//   },
//   lg: {
//     container: "w-40 h-40",
//     icon: "w-8 h-8"
//   },
//   xl: {
//     container: "w-48 h-48",
//     icon: "w-10 h-10"
//   }
// };

// export default function AvatarUpload({ 
//   avatarUrl, 
//   onUpload,
//   onDelete,
//   size = "lg",
//   className = ""
// }) {
//   const inputRef = useRef(null);
//   const [loading, setLoading] = useState(false);
//   const [dragActive, setDragActive] = useState(false);

//   // Get size classes with fallback to 'lg' if invalid size is provided
//   const sizeConfig = sizeClasses[size] || sizeClasses.lg;

//   const handleFileChange = async (file) => {
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith("image/")) {
//       toast.error("Please upload an image file (JPEG, PNG, WEBP)");
//       return;
//     }

//     // Validate file size (max 2MB)
//     if (file.size > 2 * 1024 * 1024) {
//       toast.error("File size exceeds 2MB limit");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("avatar", file);

//     try {
//       setLoading(true);
//     const response = await API.put("/users/update-avatar", formData, {
//   headers: { "Content-Type": "multipart/form-data" },
// });


//       if (response.data.success) {
//         onUpload(response.data.data.avatar);
//         toast.success("Profile picture updated successfully!");
//       } else {
//         throw new Error(response.data.message || "Failed to upload avatar");
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(error.response?.data?.message || "Failed to upload profile picture");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     handleFileChange(e.target.files?.[0]);
//     e.target.value = "";
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(e.type === "dragenter" || e.type === "dragover");
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files?.[0]) {
//       handleFileChange(e.dataTransfer.files[0]);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       setLoading(true);
//       const response = await API.delete("/users/remove-avatar");
      
//       if (response.data.success) {
//         onDelete();
//         toast.success("Profile picture removed successfully!");
//       } else {
//         throw new Error(response.data.message || "Failed to remove avatar");
//       }
//     } catch (error) {
//       console.error("Delete error:", error);
//       toast.error(error.response?.data?.message || "Failed to remove profile picture");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={`relative group ${className}`}>
//       <motion.div
//         className={`${sizeConfig.container} rounded-full border-2 border-dashed 
//           ${dragActive ? "border-primary bg-primary/10" : "border-muted"}
//           cursor-pointer transition-colors duration-200 overflow-hidden flex items-center justify-center`}
//         whileHover={{ scale: 1.03 }}
//         onClick={() => inputRef.current?.click()}
//         onDragEnter={handleDrag}
//         onDragLeave={handleDrag}
//         onDragOver={handleDrag}
//         onDrop={handleDrop}
//       >
//         {loading ? (
//           <div className="flex items-center justify-center w-full h-full bg-muted">
//             <Loader2 className={`${sizeConfig.icon} animate-spin text-primary`} />
//           </div>
//         ) : avatarUrl ? (
//           <>
//             <img
//               src={avatarUrl}
//               alt="Profile"
//               className="w-full h-full object-cover"
//               onError={(e) => {
//                 e.target.src = "/default-avatar.jpg";
//               }}
//             />
//             <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//               <button
//                 className="bg-background/80 hover:bg-background text-foreground p-2 rounded-full"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   inputRef.current?.click();
//                 }}
//               >
//                 <UploadCloud className="w-4 h-4" />
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center w-full h-full bg-muted gap-2">
//             <User className={`${sizeConfig.icon} text-muted-foreground`} />
//             <p className="text-xs text-center text-muted-foreground">
//               Click to upload
//             </p>
//           </div>
//         )}
//       </motion.div>

//       {avatarUrl && !loading && (
//         <button
//           className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
//           onClick={(e) => {
//             e.stopPropagation();
//             handleDelete();
//           }}
//         >
//           <X className="w-3 h-3" />
//         </button>
//       )}

//       {dragActive && (
//         <div className="absolute inset-0 border-4 border-dashed border-primary rounded-full pointer-events-none flex items-center justify-center bg-primary/10 backdrop-blur-sm">
//           <div className="text-center p-2 bg-background rounded-lg shadow-lg border">
//             <UploadCloud className="w-6 h-6 mx-auto text-primary mb-1" />
//             <p className="text-xs">Drop to upload</p>
//           </div>
//         </div>
//       )}

//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleInputChange}
//         ref={inputRef}
//         className="hidden"
//       />
//     </div>
//   );
// }

"use client"; // Only needed in Next.js App Router (remove if not using it)

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, UploadCloud, User, X } from "lucide-react";
import API from "../../../utils/axiosInstance";

const sizeClasses = {
  sm: {
    container: "w-20 h-20",
    icon: "w-5 h-5"
  },
  md: {
    container: "w-32 h-32",
    icon: "w-6 h-6"
  },
  lg: {
    container: "w-40 h-40",
    icon: "w-8 h-8"
  },
  xl: {
    container: "w-48 h-48",
    icon: "w-10 h-10"
  }
};

export default function AvatarUpload({ 
  avatarUrl, 
  onUpload,
  onDelete,
  size = "lg",
  className = ""
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const sizeConfig = sizeClasses[size] || sizeClasses.lg;

  const handleFileChange = async (file) => {
    if (loading || !file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WEBP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);

      const response = await API.put("/users/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        onUpload(response.data.data.avatar);
        toast.success("Profile picture updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to upload avatar");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    handleFileChange(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const response = await API.delete("/users/remove-avatar");
      
      if (response.data.success) {
        onDelete();
        toast.success("Profile picture removed successfully!");
      } else {
        throw new Error(response.data.message || "Failed to remove avatar");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to remove profile picture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <motion.div
        className={`${sizeConfig.container} rounded-full border-2 border-dashed 
          ${dragActive ? "border-primary bg-primary/10" : "border-muted"}
          cursor-pointer transition-colors duration-200 overflow-hidden flex items-center justify-center`}
        whileHover={{ scale: 1.03 }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex items-center justify-center w-full h-full bg-muted">
            <Loader2 className={`${sizeConfig.icon} animate-spin text-primary`} />
          </div>
        ) : avatarUrl ? (
          <>
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                if (e.target.src !== "/default-avatar.jpg") {
                  e.target.src = "/default-avatar.jpg";
                }
              }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                className="bg-background/80 hover:bg-background text-foreground p-2 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <UploadCloud className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-muted gap-2">
            <User className={`${sizeConfig.icon} text-muted-foreground`} />
            <p className="text-xs text-center text-muted-foreground">
              Click to upload
            </p>
          </div>
        )}
      </motion.div>

      {avatarUrl && !loading && (
        <button
          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {dragActive && (
        <div className="absolute inset-0 border-4 border-dashed border-primary rounded-full pointer-events-none flex items-center justify-center bg-primary/10 backdrop-blur-sm">
          <div className="text-center p-2 bg-background rounded-lg shadow-lg border">
            <UploadCloud className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-xs">Drop to upload</p>
          </div>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        ref={inputRef}
        className="hidden"
      />
    </div>
  );
}
