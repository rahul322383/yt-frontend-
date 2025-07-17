// import React, { useState, useEffect, useRef } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { motion } from "framer-motion";
// import { Loader2 } from "lucide-react";

// const schema = z.object({
//   fullName: z.string().min(1, "Full name is required"),
//   email: z.string().email("Invalid email address"),
//   notificationsEnabled: z.boolean(),
// });

// const debounce = (func, delay) => {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => func(...args), delay);
//   };
// };

// const SwitchButton = ({ checked, onChange }) => (
//   <button
//     type="button"
//     onClick={() => onChange(!checked)}
//     className={`w-12 h-6 flex items-center rounded-full transition-colors duration-300 ${
//       checked ? "bg-blue-500" : "bg-gray-400"
//     }`}
//   >
//     <span
//       className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
//         checked ? "translate-x-6" : ""
//       }`}
//     ></span>
//   </button>
// );

// const AccountSettings = ({ user, setUser }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, dirtyFields },
//     reset,
//     setValue,
//     watch,
//     trigger,
//   } = useForm({
//     resolver: zodResolver(schema),
//   });

//   const [isSaving, setIsSaving] = useState(false);
//   const [fieldLoading, setFieldLoading] = useState({});

//   const debounceRef = useRef({});

//   useEffect(() => {
//     if (user) {
//       reset({
//         fullName: user.fullName || "",
//         email: user.email || "",
//         notificationsEnabled: user.notificationsEnabled || false,
//       });
//     }
//   }, [user, reset]);

//   const handleUpdateAccount = async (data, auto = false, field = null) => {
//     if (field && !dirtyFields[field]) return; // only update if field is dirty

//     setIsSaving(true);
//     if (field) setFieldLoading((prev) => ({ ...prev, [field]: true }));

//     try {
//       const res = await axios.put("/users/update-account", data);

//       if (res.data?.user) {
//         setUser(res.data.user);
//         reset(res.data.user); // clears dirtyFields
//         if (!auto) toast.success("Account updated successfully!");
//       } else {
//         toast.error("Something went wrong.");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update account.");
//     } finally {
//       setIsSaving(false);
//       if (field) {
//         setFieldLoading((prev) => ({ ...prev, [field]: false }));
//       }
//     }
//   };

//   const debounceAutoSave = (field) => {
//     if (!debounceRef.current[field]) {
//       debounceRef.current[field] = debounce((val) => {
//         trigger(field).then((isValid) => {
//           if (isValid) {
//             handleUpdateAccount(watch(), true, field);
//           }
//         });
//       }, 600);
//     }
//     debounceRef.current[field](watch(field));
//   };

//   const notificationsEnabled = watch("notificationsEnabled");

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md max-w-xl mx-auto"
//     >
//       <h3 className="text-xl font-semibold mb-4 dark:text-white">
//         Account Settings
//       </h3>
//       <form onSubmit={handleSubmit((data) => handleUpdateAccount(data))} className="grid gap-5">

//         {/* Full Name */}
//         <div>
//           <label className="block text-sm font-medium mb-1 dark:text-white">
//             Full Name
//           </label>
//           <div className="relative">
//             <input
//               type="text"
//               {...register("fullName")}
//               onChange={(e) => {
//                 setValue("fullName", e.target.value);
//                 debounceAutoSave("fullName");
//               }}
//               className="w-full p-2 rounded-md border bg-white dark:bg-gray-800 dark:text-white pr-8"
//               placeholder="Your name"
//             />
//             {fieldLoading.fullName && (
//               <Loader2 className="absolute right-2 top-2 w-4 h-4 animate-spin text-gray-400" />
//             )}
//           </div>
//           {errors.fullName && (
//             <p className="text-red-600 text-sm mt-2">{errors.fullName.message}</p>
//           )}
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block text-sm font-medium mb-1 dark:text-white">
//             Email
//           </label>
//           <div className="relative">
//             <input
//               type="email"
//               {...register("email")}
//               onChange={(e) => {
//                 setValue("email", e.target.value);
//                 debounceAutoSave("email");
//               }}
//               className="w-full p-2 rounded-md border bg-white dark:bg-gray-800 dark:text-white pr-8"
//               placeholder="Email address"
//             />
//             {fieldLoading.email && (
//               <Loader2 className="absolute right-2 top-2 w-4 h-4 animate-spin text-gray-400" />
//             )}
//           </div>
//           {errors.email && (
//             <p className="text-red-600 text-sm mt-2">{errors.email.message}</p>
//           )}
//         </div>

//         {/* Notifications */}
//         <div className="flex items-center justify-between">
//           <label className="text-sm font-medium dark:text-white">
//             Enable Notifications
//           </label>
//           <SwitchButton
//             checked={notificationsEnabled}
//             onChange={(value) => {
//               setValue("notificationsEnabled", value);
//               handleUpdateAccount(
//                 { ...watch(), notificationsEnabled: value },
//                 true,
//                 "notificationsEnabled"
//               );
//             }}
//           />
//         </div>

//         <motion.button
//           type="submit"
//           whileTap={{ scale: 0.97 }}
//           className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
//           disabled={isSaving}
//         >
//           {isSaving ? "Updating..." : "Update Account"}
//         </motion.button>
//       </form>
//     </motion.div>
//   );
// };

// export default AccountSettings;

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  settings: z.object({
    notification: z.object({
      enabled: z.boolean(),
    }),
  }),
});

const SwitchButton = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    role="switch"
    aria-checked={checked}
    className={`w-12 h-6 flex items-center rounded-full transition-colors duration-300 ${
      checked ? "bg-blue-500" : "bg-gray-400"
    }`}
  >
    <span
      className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
        checked ? "translate-x-6" : ""
      }`}
    ></span>
  </button>
);

const AccountSettings = ({ user, setUser }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      settings: {
        notification: {
          enabled: false,
        },
      },
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || "",
        email: user.email || "",
        settings: {
          notification: {
            enabled: user?.settings?.notification?.enabled ?? false,
          },
        },
      });
    }
  }, [user, reset]);

  const handleUpdateAccount = async (data) => {
    setIsSaving(true);
    try {
      const res = await axios.put("/api/v1/users/update-account", data);

      if (res.data?.user) {
        setUser(res.data.user);
        reset({
          fullName: res.data.user.fullName,
          email: res.data.user.email,
          settings: {
            notification: {
              enabled: res.data.user?.settings?.notification?.enabled,
            },
          },
        });
        toast.success("Account updated successfully!");
      } else {
        toast.error("Something went wrong while updating your account.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update account.");
    } finally {
      setIsSaving(false);
    }
  };

  const notificationsEnabled = watch("settings.notification.enabled");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md max-w-xl mx-auto"
    >
      <h3 className="text-xl font-semibold mb-4 dark:text-white">
        Account Settings
      </h3>
      <form className="grid gap-5" onSubmit={handleSubmit(handleUpdateAccount)}>
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Full Name
          </label>
          <input
            type="text"
            {...register("fullName")}
            className="w-full p-2 rounded-md border bg-white dark:bg-gray-800 dark:text-white"
            placeholder="Your name"
          />
          {errors.fullName && (
            <p className="text-red-600 text-sm mt-2">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full p-2 rounded-md border bg-white dark:bg-gray-800 dark:text-white"
            placeholder="Email address"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-2">{errors.email.message}</p>
          )}
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium dark:text-white">
            Enable Notifications
          </label>
          <SwitchButton
            checked={notificationsEnabled}
            onChange={(val) =>
              setValue("settings.notification.enabled", val, {
                shouldDirty: true,
              })
            }
          />
        </div>

        {/* Save Button */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving || Object.keys(dirtyFields).length === 0}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AccountSettings;
