// import { useEffect, useState, useRef } from "react";
// import { Input } from "../components/ui/Input.jsx";
// import { Search, Loader2, Video, User, Book, X } from "lucide-react";
// import { cn } from "../../utils/cn.jsx";
// import { useNavigate } from "react-router-dom";
// import API from "../../utils/axiosInstance.jsx";
// import "../../index.css";

// export default function SearchBar({ placeholder = "Search...", className }) {
//   const [query, setQuery] = useState("");
//   const [debouncedQuery, setDebouncedQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(-1);
//   const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

//   const resultsRef = useRef(null);
//   const navigate = useNavigate();

//   // Debounce the input
//   useEffect(() => {
//     const handler = setTimeout(() => setDebouncedQuery(query.trim()), 300);
//     return () => clearTimeout(handler);
//   }, [query]);

//   useEffect(() => {
//     if (debouncedQuery) {
//       fetchSearchResults(debouncedQuery);
//     } else {
//       setResults([]);
//     }
//   }, [debouncedQuery]);

//   const fetchSearchResults = async (searchTerm) => {
//     setLoading(true);
//     try {
//       // Replace with real API call
//       const dummyData = {
//         videos: [
//           { id: "1", type: "video", title: "React Tutorial", icon: <Video size={16} /> },
//           { id: "2", type: "video", title: "Tailwind Crash Course", icon: <Video size={16} /> },
//         ],
//         channels: [
//           { id: "3", type: "channel", title: "Rahul Codes", icon: <User size={16} /> },
//         ],
//         playlists: [
//           { id: "4", type: "playlist", title: "Frontend Mastery", icon: <Book size={16} /> },
//         ],
//       };

//       const filtered = Object.entries(dummyData).flatMap(([group, items]) =>
//         items.filter((item) =>
//           item.title.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );

//       setResults(filtered);
//       setSelectedIndex(0);
//     } catch (err) {
//       console.error("Search error", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (!results.length) return;

//     if (e.key === "ArrowDown") {
//       setSelectedIndex((prev) => (prev + 1) % results.length);
//     } else if (e.key === "ArrowUp") {
//       setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
//     } else if (e.key === "Enter" && results[selectedIndex]) {
//       handleResultSelect(results[selectedIndex]);
//     }
//   };

//   const handleResultSelect = (result) => {
//     setQuery(result.title);
//     setResults([]);
//     setIsMobileSheetOpen(false);

//     if (result.type === "video") {
//       navigate(`/video/${result.id}`);
//     } else if (result.type === "channel") {
//       navigate(`/channel/${result.id}`);
//     } else if (result.type === "playlist") {
//       navigate(`/playlist/${result.id}`);
//     }
//   };

//   // Outside click to close results
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (resultsRef.current && !resultsRef.current.contains(e.target)) {
//         setResults([]);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <>
//       {/* Desktop Search */}
//       <div className={cn("relative w-full max-w-md hidden sm:block", className)}>
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
//         <Input
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder={placeholder}
//           className="pl-10 pr-10"
//         />
//         {loading && (
//           <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
//         )}
//         {results.length > 0 && (
//           <div
//             ref={resultsRef}
//             className="absolute z-50 mt-1 w-full rounded-lg border bg-white dark:bg-gray-900 p-1 shadow-xl max-h-64 overflow-y-auto"
//           >
//             {results.map((result, index) => (
//               <div
//                 key={result.id || index}
//                 className={cn(
//                   "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
//                   index === selectedIndex
//                     ? "bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-300"
//                     : "hover:bg-gray-100 dark:hover:bg-gray-800"
//                 )}
//                 onMouseEnter={() => setSelectedIndex(index)}
//                 onClick={() => handleResultSelect(result)}
//               >
//                 {result.icon}
//                 <span>{result.title}</span>
//                 <span className="ml-auto text-xs text-gray-400 capitalize">
//                   {result.type}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Mobile Search Button */}
//       <button
//         onClick={() => setIsMobileSheetOpen(true)}
//         className="sm:hidden flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700"
//       >
//         <Search size={18} />
//         <span className="text-gray-600 dark:text-gray-200">Search</span>
//       </button>

//       {/* Mobile Bottom Sheet */}
//       {isMobileSheetOpen && (
//         <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col justify-end sm:hidden">
//           <div className="bg-white dark:bg-gray-900 rounded-t-2xl p-4 max-h-[90%] overflow-y-auto shadow-xl">
//             <div className="flex justify-between items-center mb-3">
//               <span className="text-lg font-semibold">Search</span>
//               <button
//                 onClick={() => setIsMobileSheetOpen(false)}
//                 className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 <X />
//               </button>
//             </div>

//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
//               <Input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder={placeholder}
//                 autoFocus
//                 className="pl-10 pr-10"
//               />
//               {loading && (
//                 <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
//               )}
//             </div>

//             <div className="mt-4 space-y-1">
//               {results.length > 0 ? (
//                 results.map((result, index) => (
//                   <div
//                     key={result.id || index}
//                     className={cn(
//                       "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer",
//                       index === selectedIndex
//                         ? "bg-blue-100 dark:bg-gray-800"
//                         : "hover:bg-gray-100 dark:hover:bg-gray-800"
//                     )}
//                     onMouseEnter={() => setSelectedIndex(index)}
//                     onClick={() => handleResultSelect(result)}
//                   >
//                     {result.icon}
//                     <span>{result.title}</span>
//                     <span className="ml-auto text-xs text-gray-400 capitalize">
//                       {result.type}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 !loading && (
//                   <div className="text-center text-gray-400 py-6 text-sm">
//                     No results found
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import SkeletonCard from "../components/Statscard/SkeletonCard";
import { Video, User, Book } from "lucide-react";
import API from "../../utils/axiosInstance";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced search call
  const fetchSearchResults = useCallback(async (searchTerm) => {
    setLoading(true);
    try {
      const res = await API.get(`/user/playlist/search?query=${searchTerm}`);
      const mapped = res.data.results.map((item) => {
        let icon;
        if (item.type === "video") icon = <Video size={16} />;
        else if (item.type === "channel") icon = <User size={16} />;
        else if (item.type === "playlist") icon = <Book size={16} />;
        return { ...item, icon };
      });
      setResults(mapped);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce input
  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim()) {
        fetchSearchResults(query.trim());
        setShowResults(true);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query, fetchSearchResults]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      navigateTo(results[selectedIndex]);
    }
  };

  const navigateTo = (item) => {
    if (!item) return;
    if (item.type === "video") navigate(`/video/${item.id}`);
    else if (item.type === "channel") navigate(`/channel/${item.channelId }`);
    else if (item.type === "playlist") navigate(`/playlist/${item.id}`);
    setShowResults(false);
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:w-96" ref={containerRef}>
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search videos, channels, playlists..."
        className="rounded-lg px-8 py-2 text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim() && setShowResults(true)}
      />

      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded shadow-md max-h-72 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No results found.</div>
          ) : (
            results.map((result, index) => (
              <div
                key={result.id}
                className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? "bg-gray-200 dark:bg-zinc-700"
                    : "hover:bg-gray-100 dark:hover:bg-zinc-700"
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => navigateTo(result)}
              >
                <span className="mr-2">{result.icon}</span>
                <span>{result.title}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
