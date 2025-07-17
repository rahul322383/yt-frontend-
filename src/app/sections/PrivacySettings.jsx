import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { SwitchButton } from "../components/ui/switch.jsx";
import { Button } from "../components/ui/button.jsx";
import { toast } from "sonner";
import { motion } from "framer-motion";

const privacySchema = z.object({
  showProfilePicture: z.boolean(),
  allowMessages: z.boolean(),
});

export default function PrivacySettings() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      showProfilePicture: false,
      allowMessages: false,
    },
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/v1/users/settings/privacy");
        reset(res.data.data || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load privacy settings.");
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      await axios.put("/api/v1/users/settings/privacy", values);
      toast.success("Privacy settings updated.");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500); // Auto-reset success state after 2.5s
    } catch (err) {
      console.error(err);
      toast.error("Failed to update privacy settings.");
    }
  };

  const showProfilePicture = watch("showProfilePicture");
  const allowMessages = watch("allowMessages");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
      <div>
        <SwitchButton
          id="showProfilePicture"
          label="Show Profile Picture"
          checked={showProfilePicture}
          onCheckedChange={(val) => setValue("showProfilePicture", val)}
        />
      </div>
      <div>
        <SwitchButton
          id="allowMessages"
          label="Allow Messages"
          checked={allowMessages}
          onCheckedChange={(val) => setValue("allowMessages", val)}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          type="submit"
          disabled={isSubmitting || isSaved}
          className="w-full flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {isSubmitting
            ? "Saving..."
            : isSaved
            ? "Saved ✅"
            : "Save Settings"}
        </Button>
      </motion.div>
    </form>
  );
}
