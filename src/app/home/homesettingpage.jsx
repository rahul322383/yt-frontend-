// SettingsPageHome.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../utils/axiosInstance"; // adjust path if needed

const SettingItem = ({ label, children }) => (
  <div className="mb-6">
    <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
      {label}
    </label>
    {children}
  </div>
);

const SettingsPageHome = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState("system");
  const [notifications, setNotifications] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
        setUsername(storedUser.username || "");
      }
    } catch (err) {
      console.error("Invalid user data in localStorage");
    }
  }, []);

  const handleSave = async () => {
    try {
      if (!user) return;

      await API.put(`/users/update/${user._id}`, {
        username,
        password,
      });

      await API.put(`/users/settings/${user._id}`, {
        theme,
        notifications,
      });

      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings.");
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/users/delete/${user._id}`);
      localStorage.removeItem("user");
      toast.success("Account deleted.");
      navigate("/signup");
    } catch (err) {
      toast.error("Error deleting account.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
            You're not logged in
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Login to access your settings
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 text-gray-900 dark:text-white">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Settings</h1>
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded"
          >
            ☰
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SettingItem label="Username">
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </SettingItem>

            <SettingItem label="Password">
              <input
                type="password"
                className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </SettingItem>

            <SettingItem label="Theme Preference">
              <select
                className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </SettingItem>

            <SettingItem label="Notifications">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                Enable Email Alerts
              </label>
            </SettingItem>

            <details className="mb-6">
              <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-200">
                Advanced Preferences
              </summary>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Auto-play next video
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Show sensitive content
                </label>
              </div>
            </details>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Save Settings
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-red-500 hover:text-red-700 text-sm underline"
              >
                Delete My Account
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Settings Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="fixed right-0 top-0 w-3/4 h-full bg-white dark:bg-gray-900 p-4 shadow-lg">
            <button onClick={() => setIsMobileDrawerOpen(false)} className="mb-4">
              Close
            </button>
            {/* Settings can be placed here too if duplicating on mobile */}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Confirm Account Deletion
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This action is permanent. Are you sure?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Yes, delete
              </button>
              <button
                className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPageHome;
