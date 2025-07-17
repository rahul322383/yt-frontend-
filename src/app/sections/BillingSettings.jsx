import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { SwitchButton } from "../components/ui/switch.jsx"; // Your custom switch
import { Button } from "../components/ui/button.jsx";
import { toast } from "sonner";

// Schema
const billingSchema = z.object({
  billingNotifications: z.boolean(),
  autoRenewal: z.boolean(),
});

export default function BillingSettings() {
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      billingNotifications: false,
      autoRenewal: false,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/users/settings/billing");
        reset(res?.data?.data || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load billing settings.");
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      await axios.put("/users/settings/billing", values);
      toast.success("Billing settings updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update billing settings.");
    }
  };

  const billingNotifications = watch("billingNotifications");
  const autoRenewal = watch("autoRenewal");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
      {/* Billing Notifications Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Email me billing notifications</span>
        <SwitchButton
          id="billingNotifications"
          checked={billingNotifications}
          onCheckedChange={(val) => setValue("billingNotifications", val)}
        />
      </div>

      {/* Auto-Renew Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Auto-renew subscription</span>
        <SwitchButton
          id="autoRenewal"
          checked={autoRenewal}
          onCheckedChange={(val) => setValue("autoRenewal", val)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
