import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { SwitchButton } from "../components/ui/switch.jsx"; // Assuming SwitchButton is your custom Switch component
import { Button } from "../components/ui/button.jsx";
import { toast } from "sonner";

// Zod schema for connected apps
const connectedAppsSchema = z.object({
  googleConnected: z.boolean(),
  githubConnected: z.boolean(),
});

export default function ConnectedApps() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(connectedAppsSchema),
    defaultValues: {
      googleConnected: false,
      githubConnected: false,
    },
  });

  // Fetch connected apps settings when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/users/settings/connectedApps");
        reset(res.data.data || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load connected apps settings.");
      }
    };
    fetchSettings();
  }, [reset]);

  // Submit handler for form
  const onSubmit = async (values) => {
    try {
      await axios.put("/users/settings/connectedApps", values);
      toast.success("Connected apps updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update connected apps.");
    }
  };

  // Watch the values of the switches
  const googleConnected = watch("googleConnected");
  const githubConnected = watch("githubConnected");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="flex items-center justify-between">
          <span>Google</span>
          <SwitchButton
            {...register("googleConnected")}
            checked={googleConnected}
          />
        </label>
      </div>
      <div>
        <label className="flex items-center justify-between">
          <span>GitHub</span>
          <SwitchButton
            {...register("githubConnected")}
            checked={githubConnected}
          />
        </label>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        Save Settings
      </Button>
    </form>
  );
}
