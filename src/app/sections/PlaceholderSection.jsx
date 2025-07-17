import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { SwitchBotton } from "../components/ui/switch.jsx";
import { Button } from "../components/ui/button.jsx";
import { toast } from "sonner";
import { motion } from "framer-motion";

const placeholderSchema = z.object({
  experimentalUI: z.boolean(),
  aiAssistant: z.boolean(),
});

export default function PlaceholderSettings() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(placeholderSchema),
    defaultValues: {
      experimentalUI: false,
      aiAssistant: false,
    },
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/v1/users/settings/placeholder");
        reset(res.data.data || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load placeholder settings.");
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      await axios.put("/api/v1/users/settings/placeholder", values);
      toast.success("Placeholder settings saved.");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save placeholder settings.");
    }
  };

  const experimentalUI = watch("experimentalUI");
  const aiAssistant = watch("aiAssistant");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-lg mx-auto"
    >
      {/* Toggle: Experimental UI */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Enable Experimental UI</span>
        <SwitchBotton
          id="experimentalUI"
          checked={experimentalUI}
          onCheckedChange={(val) => setValue("experimentalUI", val)}
        />
      </div>

      {/* Toggle: AI Assistant */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Enable AI Assistant</span>
        <SwitchBotton
          id="aiAssistant"
          checked={aiAssistant}
          onCheckedChange={(val) => setValue("aiAssistant", val)}
        />
      </div>

      {/* Submit Button */}
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {isSubmitting ? "Saving..." : isSaved ? "Saved ✅" : "Save Settings"}
        </Button>
      </motion.div>
    </form>
  );
}
