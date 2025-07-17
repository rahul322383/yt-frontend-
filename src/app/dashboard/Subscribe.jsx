/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";

import { toast } from "react-hot-toast";
import API from "../../utils/axiosInstance.jsx"; // adjust path to your axiosInstance file
import { useAuth } from "../../context/AuthContext.jsx"; // adjust path to your AuthContext file



//get Get all subscribers of a channel

const getSubscribers = async (channelId) => {
  try {
    const res = await API.get(`/users/subscribe/channel/${channelId}`);
    return res.data?.data?.subscribers || [];
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return [];
  }
}   



const Subscribe = ({ targetChannelId }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth(); 

  // 🔍 Check if user is already subscribed
  const checkSubscriptionStatus = async () => {
    try {
      if (!targetChannelId || !user?.channelId) return;

      const res = await API.get(
        `/users/subscribe/subscribed/${user.channelId}`
      );

      const subscribedChannels = res.data?.data?.channels || [];
      const alreadySubscribed = subscribedChannels.some(
        (ch) => ch.channelId === targetChannelId
      );

      setIsSubscribed(alreadySubscribed);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  // 🔄 Toggle subscribe/unsubscribe
//   const handleSubscribeToggle = async () => {
//     if (!targetChannelId || !user?.channelId) return;

//     setLoading(true);
//     try {
//       const res = await axios.post(
//         `/api/v1/users/subscribe/${targetChannelId}`
//       );

//       const msg = res?.data?.message;
//       if (msg === "Subscribed successfully") {
//         toast.success("Subscribed ✅");
//         setIsSubscribed(true);
//       } else if (msg === "Unsubscribed successfully") {
//         toast.success("Unsubscribed ❌");
//         setIsSubscribed(false);
//       }
//     } catch (err) {
//       console.error("Subscription toggle error:", err);
//       toast.error("Something went wrong 😵");
//     } finally {
//       setLoading(false);
//     }
//   };

  useEffect(() => {
    checkSubscriptionStatus();
  }, [targetChannelId, user]);

  // 🙅‍♂️ Don’t show subscribe button on your own channel
  if (!user || user.channelId === targetChannelId) return null;

  return (
    <Button
      onClick={handleSubscribeToggle}
      disabled={loading}
      variant={isSubscribed ? "outline" : "default"}
      className="rounded-full px-6"
    >
      {isSubscribed ? "Subscribed" : "Subscribe"}
    </Button>
  );
};

export default Subscribe;
