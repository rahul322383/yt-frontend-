import { useEffect, useState, useRef } from "react";
import { Input } from "../components/ui/Input.jsx";
import { Search, Loader2, Video, User, Book, X } from "lucide-react";
import { cn } from "../../utils/cn.jsx";
import API from "../../utils/axiosInstance.jsx"; // Adjust the import based on your project structure
import "../../index.css"

export default function SearchBar({ placeholder = "Search...", className }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const resultsRef = useRef(null);

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const fetchSearchResults = async (searchTerm) => {
    setLoading(true);
    try {
      // Simulate API
      await new Promise((res) => setTimeout(res, 400));
      const dummyData = {
        videos: [
          { type: "video", title: "React Tutorial", icon: <Video size={16} /> },
          { type: "video", title: "Tailwind Crash Course", icon: <Video size={16} /> },
        ],
        channels: [
          { type: "channel", title: "Rahul Codes", icon: <User size={16} /> },
        ],
        playlists: [
          { type: "playlist", title: "Frontend Mastery", icon: <Book size={16} /> },
        ],
      };

      const filtered = Object.entries(dummyData).flatMap(([group, items]) =>
        items.filter((item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      setResults(filtered);
      setSelectedIndex(0);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleResultSelect(results[selectedIndex]);
    }
  };

  const handleResultSelect = (result) => {
    setQuery(result.title);
    setResults([]);
    setIsMobileSheetOpen(false);
    console.log("Selected:", result);
  };

  return (
    <>
      {/* Desktop search */}
      <div
        className={cn(
          "relative w-full max-w-md hidden sm:block",
          className
        )}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {results.length > 0 && (
          <div
            ref={resultsRef}
            className="absolute z-50 mt-1 w-full rounded-lg border bg-background p-1 shadow-xl max-h-64 overflow-y-auto"
          >
            {results.map((result, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                  index === selectedIndex
                    ? "bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-300"
                    : "hover:bg-muted"
                )}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => handleResultSelect(result)}
              >
                {result.icon}
                <span>{result.title}</span>
                <span className="ml-auto text-xs text-gray-400 capitalize">
                  {result.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile search button */}
      <button
        onClick={() => setIsMobileSheetOpen(true)}
        className="sm:hidden flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700"
      >
        <Search size={18} />
        <span className="text-gray-600 dark:text-gray-200">Search</span>
      </button>

      {/* Bottom sheet for mobile */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col justify-end sm:hidden">
          <div className="bg-white dark:bg-gray-900 rounded-t-2xl p-4 max-h-[90%] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">Search</span>
              <button
                onClick={() => setIsMobileSheetOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoFocus
                className="pl-10 pr-10"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="mt-4 space-y-1">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer",
                      index === selectedIndex
                        ? "bg-blue-100 dark:bg-gray-800"
                        : "hover:bg-muted"
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => handleResultSelect(result)}
                  >
                    {result.icon}
                    <span>{result.title}</span>
                    <span className="ml-auto text-xs text-gray-400 capitalize">
                      {result.type}
                    </span>
                  </div>
                ))
              ) : (
                !loading && (
                  <div className="text-center text-gray-400 py-6 text-sm">
                    No results found
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
