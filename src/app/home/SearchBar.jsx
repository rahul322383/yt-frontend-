"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Video, User, Book, Search, X } from "lucide-react";
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

  const fetchSearchResults = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(
        `/user/playlist/search?query=${encodeURIComponent(searchTerm)}`
      );
      

      if (res.data?.success && Array.isArray(res.data.results)) {
        const mapped = res.data.results.map((item) => {
          let icon;
          let route;

          if (item.type === "video") {
            icon = <Video size={16} className="text-blue-500" />;
            route = `/video/${item.id}`;
          } else if (item.type === "channel") {
            icon = <User size={16} className="text-green-500" />;
            route = `/channel/${item.channel}`; // ✅ fixed channelId
          } else if (item.type === "playlist") {
            icon = <Book size={16} className="text-purple-500" />;
            route = `/playlist/${item.id}`;
          }

          return {
            ...item,
            icon,
            route,
          };
        });
        setResults(mapped);
      } else {
        setResults([]);
      }
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim()) {
        fetchSearchResults(query.trim());
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query, fetchSearchResults]);

  const handleKeyDown = (e) => {
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        navigateTo(results[selectedIndex]);
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setShowResults(false);
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const navigateTo = (item) => {
    if (!item) return;
    navigate(item.route);
    setShowResults(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (query.trim() || results.length > 0) {
      setShowResults(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatSubscribers = (count) => {
    if (!count && count !== 0) return "";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M subscribers`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K subscribers`;
    }
    return `${count} subscriber${count !== 1 ? "s" : ""}`;
  };

  return (
    <div className="relative w-full max-w-2xl" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search videos, channels, playlists..."
          className="rounded-full pl-10 pr-10 py-6 text-base border-2 focus:border-blue-500 transition-colors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-700 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 && query ? (
            <div className="p-6 text-center">
              <Search size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No results found for "{query}"
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try different keywords or check spelling
              </p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-all ${
                    index === selectedIndex
                      ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                      : "hover:bg-gray-50 dark:hover:bg-zinc-800 border-l-4 border-l-transparent"
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => navigateTo(result)}
                >
                  {result.type === "channel" && result.avatar ? (
                    <img
                      src={result.avatar}
                      alt={result.title}
                      className="w-10 h-10 rounded-full mr-3 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mr-3 flex-shrink-0">
                      {result.icon}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {result.title}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="capitalize">{result.type}</span>
                      {result.type === "channel" &&
                        result.subscribers !== undefined && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{formatSubscribers(result.subscribers)}</span>
                          </>
                        )}
                      {result.isUserOnly && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-blue-500">Private</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {results.length > 0 && (
                <div className="border-t border-gray-200 dark:border-zinc-700 px-4 py-2">
                  <button
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                      setShowResults(false);
                    }}
                    className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
