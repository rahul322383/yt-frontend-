// src/components/profile/ProfileEditModal.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/button.jsx";

const schema = z.object({
  value: z.string().min(1, "This field cannot be empty"),
});

export default function ProfileEditModal({ field, currentValue, onSave, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { value: currentValue || "" },
  });

  const submitHandler = (data) => {
    onSave(data.value);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          Edit {field.charAt(0).toUpperCase() + field.slice(1)}
        </h2>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <Input {...register("value")} autoFocus />
          {errors.value && (
            <p className="text-sm text-red-500">{errors.value.message}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
