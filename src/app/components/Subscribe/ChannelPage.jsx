import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "@/lib/axios"; // your Axios instance with interceptors
import { toast } from "sonner";
import { Button } from "../components/ui/button.jsx";
import { LoaderCircle } from "lucide-react";

export default function ChannelPage() {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/users/channel/${username}`);
      setChannel(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch channel");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!channel?._id) return;
    try {
      setSubscribing(true);
      const res = await axios.post(`/subscribe/subscribe/${channel._id}`);
      toast.success(res.data.message);
      fetchChannel(); // Refresh state
    } catch (error) {
      toast.error(error.response?.data?.message || "Subscription failed");
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    fetchChannel();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoaderCircle className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!channel) return <div className="text-center text-destructive">Channel not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="relative">
        <img
          src={channel.coverImage}
          alt="Cover"
          className="w-full h-48 object-cover rounded-xl"
        />
        <div className="absolute -bottom-8 left-4 flex items-center gap-4">
          <img
            src={channel.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-background shadow-md"
          />
          <div>
            <h1 className="text-xl font-bold">{channel.fullname}</h1>
            <p className="text-muted-foreground">@{channel.username}</p>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <Button
            onClick={handleToggleSubscribe}
            disabled={subscribing}
            variant={channel.channelIsSubscribedTo ? "secondary" : "default"}
          >
            {subscribing ? "..." : channel.channelIsSubscribedTo ? "Unsubscribe" : "Subscribe"}
          </Button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-2xl font-semibold">{channel.subscribersCount}</p>
          <p className="text-sm text-muted-foreground">Subscribers</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{channel.channelIsSubscribedToCount}</p>
          <p className="text-sm text-muted-foreground">Subscribed</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{channel.videosCount}</p>
          <p className="text-sm text-muted-foreground">Videos</p>
        </div>
      </div>

      {/* Add channel videos list if needed here */}
    </div>
  );
}
