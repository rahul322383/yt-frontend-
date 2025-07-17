import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = ({ videoUrl, subtitleUrl }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        sources: [
          {
            src: videoUrl,
            type: "video/mp4",
          },
        ],
        tracks: subtitleUrl
          ? [
              {
                kind: "subtitles",
                label: "English",
                src: subtitleUrl,
                srclang: "en",
                default: true,
              },
            ]
          : [],
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoUrl, subtitleUrl]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered rounded-lg" />
    </div>
  );
};

export default VideoPlayer;
