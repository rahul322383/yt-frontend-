"use client";
import React from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const VideoModal = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <Dialog open={!!video} onClose={onClose} className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-8">
        <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-4 relative">
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-black"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
          <video
            src={video.videoUrl}
            controls
            className=" w-full max-h-[400px] mb-8"
          />
          <h2 className="text-xl font-semibold">{video.title}</h2>
          <p className="text-sm text-gray-500">{video.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VideoModal;
