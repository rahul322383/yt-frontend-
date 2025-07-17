import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { SwitchButton } from "../components/ui/switch.jsx";
import { Button } from "../components/ui/button.jsx";
import { toast } from "sonner";

const playbackSchema = z.object({
  autoplay: z.boolean(),
  hdByDefault: z.boolean(),
});

export default function PlaybackSettings() {
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(playbackSchema),
    defaultValues: {
      autoplay: false,
      hdByDefault: false,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("api/v1/users/settings/playback");
        reset(res.data.data || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load playback settings.");
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      await axios.put("api/v1/users/settings/playback", values);
      toast.success("Playback settings updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update playback settings.");
    }
  };

  const autoplay = watch("autoplay");
  const hdByDefault = watch("hdByDefault");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-4 max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-md shadow-md"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        Playback Settings
      </h2>

      <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">Autoplay next video</span>
        <SwitchButton
  checked={autoplay}
  onChange={(value) => setValue("autoplay", value)}
  // label="Autoplay next video"
/>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">Always play in HD</span>
        <SwitchButton
  checked={hdByDefault}
  onChange={(value) => setValue("hdByDefault", value)}
  // label="Always play in HD"
/>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
        {isSubmitting ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
