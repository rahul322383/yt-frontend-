import React from "react";
import { Heart } from "lucide-react";

const VideoLikeCard = ({ video }) => {
  if (!video) return null;

  const {
    _id,
    title,
    thumbnail,
    views,
    owner: { username, avatar },
  } = video;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
        <div className="flex items-center gap-2">
          <img
            src={avatar}
            alt={username}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">{username}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{views} views</span>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span>Liked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLikeCard;
