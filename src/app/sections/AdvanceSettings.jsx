import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { SwitchButton } from "../components/ui/switch.jsx"; // Assuming SwitchButton is your custom component
import { Button } from "../components/ui/button.jsx";
import { toast } from "sonner";

// Schema for advanced settings
const advancedSchema = z.object({
  developerMode: z.boolean(),
  betaFeatures: z.boolean(),
  enableLogs: z.boolean(),
});

export default function AdvancedSettings() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(advancedSchema),
    defaultValues: {
      developerMode: false,
      betaFeatures: false,
      enableLogs: false,
    },
  });

  // Fetch current settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/users/settings/advancedSettings");
        reset(res.data.data || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load advanced settings.");
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      await axios.put("/users/settings/advancedSettings", values);
      toast.success("Advanced settings saved.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save advanced settings.");
    }
  };

  const developerMode = watch("developerMode");
  const betaFeatures = watch("betaFeatures");
  const enableLogs = watch("enableLogs");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="flex items-center justify-between">
          <span>Enable Developer Mode</span>
          <SwitchButton
            {...register("developerMode")}
            checked={developerMode}
          />
        </label>
      </div>
      <div>
        <label className="flex items-center justify-between">
          <span>Join Beta Features</span>
          <SwitchButton
            {...register("betaFeatures")}
            checked={betaFeatures}
          />
        </label>
      </div>
      <div>
        <label className="flex items-center justify-between">
          <span>Enable System Logs</span>
          <SwitchButton
            {...register("enableLogs")}
            checked={enableLogs}
          />
        </label>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        Save Settings
      </Button>
    </form>
  );
}
