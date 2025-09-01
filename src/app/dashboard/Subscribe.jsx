/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";

import { toast } from "react-hot-toast";
import API from "../../utils/axiosInstance.jsx"; // adjust path to your axiosInstance file
import { useAuth } from "../../context/AuthContext.jsx"; // adjust path to your AuthContext file
import { Button } from "../components/ui/button"; // adjust this import to your UI library 




const getSubscribers = async (channelId) => {
  try {
    const res = await API.get(`/users/subscribe/channel/${channelId}`);
    return res.data?.data?.subscribers || [];
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return [];
  }
};

const Subscribe = ({ targetChannelId }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const checkSubscriptionStatus = async () => {
    try {
      if (!targetChannelId || !user?.channelId) return;

      const res = await API.get(`/users/subscribe/subscribed/${user.channelId}`);
      const subscribedChannels = res.data?.data?.channels || [];
      const alreadySubscribed = subscribedChannels.some(
        (ch) => ch.channelId === targetChannelId
      );
      setIsSubscribed(alreadySubscribed);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, [targetChannelId, user]);

  const handleSubscribeToggle = async () => {
    if (!user) {
      toast.error("Please login to subscribe");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post(`/users/subscribe/toggle`, {
        targetChannelId,
      });

      if (res.data?.success) {
        setIsSubscribed((prev) => !prev);
        toast.success(res.data.message || (isSubscribed ? "Unsubscribed" : "Subscribed"));
      }
    } catch (error) {
      toast.error("Failed to toggle subscription");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
