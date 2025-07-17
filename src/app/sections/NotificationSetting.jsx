import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { SwitchButton } from "../components/ui/switch.jsx"; // assuming this is your custom switch component
import { Button } from "../components/ui/button.jsx"
import { toast } from "sonner";

// Zod schema to validate the notification settings
const notificationSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
});

export default function NotificationSetting() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email: false,
      sms: false,
    },
  });

  // Fetch the current notification settings from the backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/users/settings/notification");
        reset(res.data.data || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load notification settings.");
      }
    };
    fetchSettings();
  }, [reset]);

  // Submit the form to update notification settings
  const onSubmit = async (values) => {
    try {
      await axios.put("/users/settings/notification", values);
      toast.success("Notification settings updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update settings.");
    }
  };

  const emailEnabled = watch("email");
  const smsEnabled = watch("sms");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="flex items-center justify-between">
          <span>Email Notifications</span>
          {/* Switch for email notifications */}
          <SwitchButton {...register("email")} checked={emailEnabled} />
        </label>
      </div>
      <div>
        <label className="flex items-center justify-between">
          <span>SMS Notifications</span>
          {/* Switch for SMS notifications */}
          <SwitchButton {...register("sms")} checked={smsEnabled} />
        </label>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        Save Settings
      </Button>
    </form>
  );
}


// Sample Express controller for SMS

