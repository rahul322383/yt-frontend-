// import React, { useState } from "react";
// import {
//   FaFacebookF,
//   FaTwitter,
//   FaLinkedinIn,
//   FaWhatsapp,
//   FaLink,
// } from "react-icons/fa";

// const ShareButton = ({ video }) => {
//   const [isCopied, setIsCopied] = useState(false);

//   if (!video?.videoId || !video?.title) return null;

//   const shareUrl = `${window.location.origin}/video/${video.videoId}`;

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(shareUrl);
//       setIsCopied(true);
//       setTimeout(() => setIsCopied(false), 2000);
//     } catch (err) {
//       console.error("Copy failed:", err);
//     }
//   };

//   const handleShare = (platform) => {
//     const encodedTitle = encodeURIComponent(video.title);
//     const encodedUrl = encodeURIComponent(shareUrl);
//     let url = "";

//     switch (platform) {
//       case "facebook":
//         url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
//         break;
//       case "twitter":
//         url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
//         break;
//       case "linkedin":
//         url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
//         break;
//       case "whatsapp":
//         url = `https://wa.me/?text=${encodedTitle} - ${encodedUrl}`;
//         break;
//       default:
//         return;
//     }

//     window.open(url, "_blank", "noopener,noreferrer");
//   };

//   return (
//     <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
//       {/* Copy Link */}
//       <button
//         onClick={!isCopied ? handleCopy : undefined}
//         disabled={isCopied}
//         className="flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm text-gray-700 dark:text-gray-200"
//       >
//         <FaLink />
//         {isCopied ? "Copied!" : "Copy"}
//       </button>

//       {/* Socials */}
//       <button
//         onClick={() => handleShare("facebook")}
//         aria-label="Facebook"
//         className="text-blue-600 hover:scale-110 transition-transform"
//       >
//         <FaFacebookF />
//       </button>
//       <button
//         onClick={() => handleShare("twitter")}
//         aria-label="Twitter"
//         className="text-blue-400 hover:scale-110 transition-transform"
//       >
//         <FaTwitter />
//       </button>
//       <button
//         onClick={() => handleShare("linkedin")}
//         aria-label="LinkedIn"
//         className="text-blue-700 hover:scale-110 transition-transform"
//       >
//         <FaLinkedinIn />
//       </button>
//       <button
//         onClick={() => handleShare("whatsapp")}
//         aria-label="WhatsApp"
//         className="text-green-500 hover:scale-110 transition-transform"
//       >
//         <FaWhatsapp />
//       </button>
//     </div>
//   );
// };

// export default ShareButton;


import React, { useState } from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaLink } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ShareButton = ({ video }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!video?.videoId || !video?.title) {
    return null;
  }

  const shareUrl = `${window.location.origin}/video/${video.videoId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = (platform) => {
    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(video.title)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(video.title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${video.title} - ${shareUrl}`)}`
    };

    if (shareLinks[platform]) {
      window.open(shareLinks[platform], '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="inline-flex items-center space-x-2 p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition">
      <button
        onClick={!isCopied ? handleCopy : undefined}
        disabled={isCopied}
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-gray-300 transition text-sm text-gray-700"
        aria-label={isCopied ? 'Link copied' : 'Copy link'}
      >
        <FaLink />
        {isCopied ? 'Copied!' : 'Copy'}
      </button>

      {['facebook', 'twitter', 'linkedin', 'whatsapp'].map((platform) => {
        const icons = {
          facebook: <FaFacebookF className="text-blue-600" />,
          twitter: <FaTwitter className="text-blue-400" />,
          linkedin: <FaLinkedinIn className="text-blue-700" />,
          whatsapp: <FaWhatsapp className="text-green-500" />
        };

        return (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            aria-label={`Share on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
            className="hover:scale-110 transition-transform"
          >
            {icons[platform]}
          </button>
        );
      })}
    </div>
  );
};

ShareButton.propTypes = {
  video: PropTypes.shape({
    videoId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  }).isRequired
};

export default ShareButton;