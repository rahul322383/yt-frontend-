/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../utils/axiosInstance.jsx";

const settingsSections = [
  { key: "account", label: "Account" },
  { key: "notifications", label: "Notifications" },
  { key: "privacy", label: "Privacy" },
  { key: "appearance", label: "Appearance" },
  { key: "language", label: "Language" },
  { key: "security", label: "Password & Security" },
  { key: "apps", label: "Connected Apps" },
  { key: "billing", label: "Billing" },
  { key: "advanced", label: "Advanced" },
  { key: "blocklist", label: "Blocked Users" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const [settingsData, setSettingsData] = useState({});
  const [lastSaved, setLastSaved] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load settings data
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get(`/settings/${activeSection}`);
        setSettingsData(res.data);
        setLastSaved(res.data);
      } catch (err) {
        setError("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [activeSection]);

  const updateSettings = (section, data) => {
    setSettingsData((prev) => ({ ...prev, ...data }));

    if (section === "language") {
      localStorage.setItem("appLang", data.language);
      setTimeout(() => window.location.reload(), 400);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await API.put(`/settings/${activeSection}`, settingsData);
      setSettingsData(res.data);
      setLastSaved(res.data);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const undoChanges = () => {
    setSettingsData(lastSaved);
  };

  const hasChanges = JSON.stringify(settingsData) !== JSON.stringify(lastSaved);

  const sectionContent = {
    account: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Account Information</h2>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <p className="text-gray-900 dark:text-gray-100">{settingsData.email || "Not available"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <p className="text-gray-900 dark:text-gray-100">{settingsData.username || "Not available"}</p>
          </div>
        </div>
      </div>
    ),
    notifications: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Notification Preferences</h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailUpdates"
              checked={settingsData?.emailUpdates || false}
              onChange={(e) => updateSettings("notifications", { emailUpdates: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="emailUpdates" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Email Notifications
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notificationSound"
              checked={settingsData?.notificationSound || false}
              onChange={(e) => updateSettings("notifications", { notificationSound: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="notificationSound" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Notification Sound
            </label>
          </div>
        </div>
      </div>
    ),
    privacy: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Privacy Settings</h2>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hideSubscriptions"
            checked={settingsData?.hideSubscriptions || false}
            onChange={(e) => updateSettings("privacy", { hideSubscriptions: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="hideSubscriptions" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Hide Subscriptions from Public View
          </label>
        </div>
      </div>
    ),
    appearance: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Appearance</h2>
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Theme
          </label>
          <select
            id="theme"
            value={settingsData?.theme || "light"}
            onChange={(e) => updateSettings("appearance", { theme: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
      </div>
    ),
    language: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Language</h2>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Language
          </label>
          <select
            id="language"
            value={settingsData?.language || "en"}
            onChange={(e) => updateSettings("language", { language: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>
    ),
    security: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Password & Security</h2>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter new password"
            onChange={(e) => updateSettings("security", { password: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
          />
        </div>
      </div>
    ),
    apps: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Connected Apps</h2>
        {settingsData?.apps?.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {settingsData.apps.map((app) => (
              <li key={app} className="py-2 text-gray-700 dark:text-gray-300">
                {app}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No connected apps</p>
        )}
      </div>
    ),
    billing: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Billing Information</h2>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Plan</label>
            <p className="text-gray-900 dark:text-gray-100">{settingsData?.plan || "Free"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Payment Date</label>
            <p className="text-gray-900 dark:text-gray-100">{settingsData?.renewalDate || "N/A"}</p>
          </div>
        </div>
      </div>
    ),
    advanced: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Advanced Settings</h2>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="experimental"
            checked={settingsData?.experimental || false}
            onChange={(e) => updateSettings("advanced", { experimental: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="experimental" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Beta Features
          </label>
        </div>
      </div>
    ),
    blocklist: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Blocked Users</h2>
        {settingsData?.blocked?.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {settingsData.blocked.map((user) => (
              <li key={user} className="py-2 text-gray-700 dark:text-gray-300">
                {user}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No blocked users</p>
        )}
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          {isMobile ? (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
              <select
                className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
              >
                {settingsSections.map((section) => (
                  <option key={section.key} value={section.key}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <aside className="w-full md:w-64 p-4 border-r border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Settings</h1>
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSection === section.key
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}
                    {sectionContent[activeSection]}
                    {hasChanges && (
                      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={saveSettings}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {saving ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                        <button
                          onClick={undoChanges}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                          Discard Changes
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}




// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import API from "../../utils/axiosInstance.jsx";
// import {
//   FiUser, FiBell, FiLock, FiMoon, FiGlobe, FiShield, FiLink, FiCreditCard, FiSettings, FiUsers, FiChevronRight
// } from "react-icons/fi";

// const settingsSections = [
//   { key: "account", label: "Account", icon: <FiUser className="w-5 h-5" /> },
//   { key: "notifications", label: "Notifications", icon: <FiBell className="w-5 h-5" /> },
//   { key: "privacy", label: "Privacy", icon: <FiLock className="w-5 h-5" /> },
//   { key: "appearance", label: "Appearance", icon: <FiMoon className="w-5 h-5" /> },
//   { key: "language", label: "Language", icon: <FiGlobe className="w-5 h-5" /> },
//   { key: "security", label: "Security", icon: <FiShield className="w-5 h-5" /> },
//   { key: "apps", label: "Connected Apps", icon: <FiLink className="w-5 h-5" /> },
//   { key: "billing", label: "Billing", icon: <FiCreditCard className="w-5 h-5" /> },
//   { key: "advanced", label: "Advanced", icon: <FiSettings className="w-5 h-5" /> },
//   { key: "blocklist", label: "Blocked Users", icon: <FiUsers className="w-5 h-5" /> },
// ];

// export default function SettingsPage() {
//   const [activeSection, setActiveSection] = useState("account");
//   const [settingsData, setSettingsData] = useState({});
//   const [lastSaved, setLastSaved] = useState({});
//   const [isMobile, setIsMobile] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   // Responsive check
//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 768);
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Load settings data
//   useEffect(() => {
//     const fetchSettings = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await API.get(`/settings/${activeSection}`);
//         setSettingsData(res.data);
//         setLastSaved(res.data);
//       } catch (err) {
//         setError("Failed to load settings. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSettings();
//   }, [activeSection]);

//   const updateSettings = (section, data) => {
//     setSettingsData((prev) => ({ ...prev, ...data }));

//     if (section === "language") {
//       localStorage.setItem("appLang", data.language);
//       setTimeout(() => window.location.reload(), 400);
//     } else if (section === "appearance") {
//       document.documentElement.classList.toggle("dark", data.theme === "dark");
//     }
//   };

//   const saveSettings = async () => {
//     try {
//       setSaving(true);
//       setError(null);
//       const res = await API.put(`/settings/${activeSection}`, settingsData);
//       setSettingsData(res.data);
//       setLastSaved(res.data);
//       setSuccess("Settings saved successfully!");
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err) {
//       setError("Failed to save settings. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const undoChanges = () => {
//     setSettingsData(lastSaved);
//   };

//   const hasChanges = JSON.stringify(settingsData) !== JSON.stringify(lastSaved);

//   const sectionContent = {
//     account: (
//       <div className="space-y-6">
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
//             {settingsData.username?.charAt(0).toUpperCase() || "U"}
//           </div>
//           <div>
//             <h2 className="text-xl font-semibold">{settingsData.username || "User"}</h2>
//             <p className="text-gray-500 dark:text-gray-400 text-sm">{settingsData.email || "email@example.com"}</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
//             <input
//               type="text"
//               value={settingsData.firstName || ""}
//               onChange={(e) => updateSettings("account", { firstName: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
//             <input
//               type="text"
//               value={settingsData.lastName || ""}
//               onChange={(e) => updateSettings("account", { lastName: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
//             <input
//               type="text"
//               value={settingsData.username || ""}
//               onChange={(e) => updateSettings("account", { username: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
//             <input
//               type="email"
//               value={settingsData.email || ""}
//               onChange={(e) => updateSettings("account", { email: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//         </div>
//       </div>
//     ),
//     notifications: (
//       <div className="space-y-6">
//         <h2 className="text-xl font-semibold">Notification Preferences</h2>
        
//         <div className="space-y-4">
//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Email Notifications</h3>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Newsletter</label>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Receive our weekly newsletter</p>
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={settingsData?.emailNewsletter || false}
//                     onChange={(e) => updateSettings("notifications", { emailNewsletter: e.target.checked })}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
//                 </label>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Updates</label>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Get notified about new features</p>
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={settingsData?.emailUpdates || false}
//                     onChange={(e) => updateSettings("notifications", { emailUpdates: e.target.checked })}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">In-App Notifications</h3>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notification Sound</label>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Play sound for new notifications</p>
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={settingsData?.notificationSound || false}
//                     onChange={(e) => updateSettings("notifications", { notificationSound: e.target.checked })}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
//                 </label>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Desktop Notifications</label>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Show notifications on your desktop</p>
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={settingsData?.desktopNotifications || false}
//                     onChange={(e) => updateSettings("notifications", { desktopNotifications: e.target.checked })}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
//                 </label>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     ),
//     privacy: (
//       <div className="space-y-6">
//         <h2 className="text-xl font-semibold">Privacy Settings</h2>
        
//         <div className="space-y-4">
//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Profile Visibility</h3>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Public Profile</label>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Make your profile visible to everyone</p>
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={settingsData?.publicProfile || false}
//                     onChange={(e) => updateSettings("privacy", { publicProfile: e.target.checked })}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
//                 </label>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hide Subscriptions</label>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Hide your subscriptions from public view</p>
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={settingsData?.hideSubscriptions || false}
//                     onChange={(e) => updateSettings("privacy", { hideSubscriptions: e.target.checked })}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Data Privacy</h3>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Collection</label>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Allow us to collect usage data</p>
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={settingsData?.allowDataCollection || false}
//                     onChange={(e) => updateSettings("privacy", { allowDataCollection: e.target.checked })}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
//                 </label>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     ),
//     appearance: (
//       <div className="space-y-6">
//         <h2 className="text-xl font-semibold">Appearance</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Theme</h3>
//             <div className="space-y-3">
//               <div className="flex items-center gap-3">
//                 <input
//                   type="radio"
//                   id="theme-light"
//                   name="theme"
//                   value="light"
//                   checked={settingsData?.theme === "light"}
//                   onChange={(e) => updateSettings("appearance", { theme: e.target.value })}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
//                 />
//                 <label htmlFor="theme-light" className="block text-sm text-gray-700 dark:text-gray-300">
//                   Light Mode
//                 </label>
//               </div>
//               <div className="flex items-center gap-3">
//                 <input
//                   type="radio"
//                   id="theme-dark"
//                   name="theme"
//                   value="dark"
//                   checked={settingsData?.theme === "dark"}
//                   onChange={(e) => updateSettings("appearance", { theme: e.target.value })}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
//                 />
//                 <label htmlFor="theme-dark" className="block text-sm text-gray-700 dark:text-gray-300">
//                   Dark Mode
//                 </label>
//               </div>
//               <div className="flex items-center gap-3">
//                 <input
//                   type="radio"
//                   id="theme-system"
//                   name="theme"
//                   value="system"
//                   checked={settingsData?.theme === "system"}
//                   onChange={(e) => updateSettings("appearance", { theme: e.target.value })}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
//                 />
//                 <label htmlFor="theme-system" className="block text-sm text-gray-700 dark:text-gray-300">
//                   System Default
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Accent Color</h3>
//             <div className="flex gap-2">
//               {["blue", "purple", "green", "red", "orange"].map((color) => (
//                 <button
//                   key={color}
//                   onClick={() => updateSettings("appearance", { accentColor: color })}
//                   className={`w-8 h-8 rounded-full bg-${color}-500 ${settingsData?.accentColor === color ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500" : ""}`}
//                   aria-label={`${color} theme`}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Font Size</h3>
//             <input
//               type="range"
//               min="12"
//               max="18"
//               value={settingsData?.fontSize || 14}
//               onChange={(e) => updateSettings("appearance", { fontSize: parseInt(e.target.value) })}
//               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
//             />
//             <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
//               <span>Small</span>
//               <span>Medium</span>
//               <span>Large</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     ),
//     language: (
//       <div className="space-y-6">
//         <h2 className="text-xl font-semibold">Language & Region</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
//             <select
//               value={settingsData?.language || "en"}
//               onChange={(e) => updateSettings("language", { language: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="en">English</option>
//               <option value="es">Spanish</option>
//               <option value="fr">French</option>
//               <option value="de">German</option>
//               <option value="ja">Japanese</option>
//               <option value="zh">Chinese</option>
//               <option value="hi">Hindi</option>
//             </select>
//           </div>

//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Zone</label>
//             <select
//               value={settingsData?.timezone || "UTC"}
//               onChange={(e) => updateSettings("language", { timezone: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="UTC">UTC</option>
//               <option value="EST">Eastern Time (EST)</option>
//               <option value="PST">Pacific Time (PST)</option>
//               <option value="CET">Central European Time (CET)</option>
//               <option value="IST">Indian Standard Time (IST)</option>
//               <option value="JST">Japan Standard Time (JST)</option>
//             </select>
//           </div>

//           <div className="space-y-1">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Format</label>
//             <select
//               value={settingsData?.dateFormat || "MM/DD/YYYY"}
//               onChange={(e) => updateSettings("language", { dateFormat: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="MM/DD/YYYY">MM/DD/YYYY</option>
//               <option value="DD/MM/YYYY">DD/MM/YYYY</option>
//               <option value="YYYY-MM-DD">YYYY-MM-DD</option>
//             </select>
//           </div>
//         </div>
//       </div>
//     ),
//     security: (
//       <div className="space-y-6">
//         <h2 className="text-xl font-semibold">Security Settings</h2>
        
//         <div className="space-y-4">
//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Password</h3>
//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
//                 <input
//                   type="password"
//                   placeholder="Enter current password"
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
//                 <input
//                   type="password"
//                   placeholder="Enter new password"
//                   onChange={(e) => updateSettings("security", { newPassword: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
//                 <input
//                   type="password"
//                   placeholder="Confirm new password"
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//               <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
//                 Change Password
//               </button>
//             </div>
//           </div>

//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Two-Factor Authentication</h3>
//             <div className="flex items-center justify-between">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">2FA Status</label>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   {settingsData?.twoFactorEnabled ? "Enabled" : "Disabled"}
//                 </p>
//               </div>
//               <button
//                 onClick={() => updateSettings("security", { twoFactorEnabled: !settingsData?.twoFactorEnabled })}
//                 className={`px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
//                   settingsData?.twoFactorEnabled
//                     ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200"
//                     : "bg-blue-600 hover:bg-blue-700 text-white"
//                 }`}
//               >
//                 {settingsData?.twoFactorEnabled ? "Disable" : "Enable"}
//               </button>
//             </div>
//           </div>

//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Active Sessions</h3>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Chrome on Windows</p>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Last active: 2 hours ago</p>
//                 </div>
//                 <button className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium">
//                   Sign Out
//                 </button>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Safari on iPhone</p>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Last active: 1 day ago</p>
//                 </div>
//                 <button className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium">
//                   Sign Out
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     ),
//     apps: (
//       <div className="space-y-6">
//         <h2 className="text-xl font-semibold">Connected Apps</h2>
        
//         <div className="space-y-4">
//           {settingsData?.apps?.length > 0 ? (
//             settingsData.apps.map((app) => (
//               <div key={app.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
//                     <FiLink className="text-blue-600 dark:text-blue-300" />
//                   </div>
//                   <div>
//                     <h3 className="font-medium">{app.name}</h3>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">Connected on {app.connectedDate}</p>
//                   </div>
//                 </div>
//                 <button className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium">
//                   Disconnect
//                 </button>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-8">
//               <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
//                 <FiLink className="text-gray-400 dark:text-gray-500 text-xl" />
//               </div>
//               <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No connected apps</h3>
//               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Connect your favorite apps to get started</p>
//             </div>
//           )}
//         </div>
//       </div>
//     ),
//     billing: (
//       <div className="space-y-6">
//         <h2 className="text-xl font-semibold">Billing Information</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Current Plan</h3>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
//                   {settingsData?.plan || "Free"}
//                 </p>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {settingsData?.plan === "Premium" ? "$9.99/month" : "$0/month"}
//                 </p>
//               </div>
//               <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
//                 Upgrade
//               </button>
//             </div>
//           </div>

//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Payment Method</h3>
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
//                 <FiCreditCard className="text-gray-500 dark:text-gray-400" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                   {settingsData?.paymentMethod || "No payment method"}
//                 </p>
//                 {settingsData?.paymentMethod && (
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Expires 12/25</p>
//                 )}
//               </div>
//             </div>
//             <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
//               {settingsData?.paymentMethod ? "Change Payment Method" : "Add Payment Method"}
//             </button>
//           </div>

//           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <h3 className="font-medium mb-3">Billing History</h3>
//             <div className="space-y-3">
//               {settingsData?.billingHistory?.length > 0 ? (
//                 settingsData.billingHistory.map((item) => (
//                   <div key={item.id} className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.description}</p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
//                     </div>
//                     <p className="text-sm font-medium">{item.amount}</p>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-sm text-gray-500 dark:text-gray-400">No billing history available</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     ),

//   };
// }