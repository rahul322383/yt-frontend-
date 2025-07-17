import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { SwitchButton } from "../components/ui/switch.jsx"; // Ensure correct import path for SwitchButton
import { Button } from "../components/ui/button.jsx";
import { toast } from "sonner";

// Schema definition
const downloadSchema = z.object({
  wifiOnly: z.boolean(),
  autoDownload: z.boolean(),
});

export default function DownloadSettings() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(downloadSchema),
    defaultValues: {
      wifiOnly: false,
      autoDownload: false,
    },
  });

  // Fetch the current settings when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/users/settings/downloads");
        reset(res.data.data || {}); // Reset form with fetched data
      } catch (err) {
        console.error(err);
        toast.error("Failed to load download settings.");
      }
    };
    fetchSettings();
  }, [reset]);

  // Handle form submission
  const onSubmit = async (values) => {
    try {
      await axios.put("/users/settings/downloads", values);
      toast.success("Download settings updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update download settings.");
    }
  };

  // Watch the current values of switches
  const wifiOnly = watch("wifiOnly");
  const autoDownload = watch("autoDownload");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="flex items-center justify-between">
          <span>Download over Wi-Fi only</span>
          <SwitchButton {...register("wifiOnly")} checked={wifiOnly} />
        </label>
      </div>
      <div>
        <label className="flex items-center justify-between">
          <span>Auto-download recommended videos</span>
          <SwitchButton {...register("autoDownload")} checked={autoDownload} />
        </label>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        Save Settings
      </Button>
    </form>
  );
}
