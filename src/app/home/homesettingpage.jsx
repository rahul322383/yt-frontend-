/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../utils/axiosInstance";
import YouTubeConnect from "../home/youtubeContext"; // Import the YouTubeConnect component
import {
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  ClockIcon,
  PaletteIcon,
  AlertTriangleIcon,
  BellIcon,
  CheckCircleIcon,
  ShieldIcon,
  SaveIcon,
  MailIcon,
  LogOutIcon,
  DownloadIcon,
  Loader2Icon,
  Trash2Icon,
  YoutubeIcon,
  LockIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import { ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { ThemeContext } from "../ThemeContext/ThemeContext.jsx"


const SettingItem = ({ label, children, description, id, icon }) => (
  <div className="mb-6 p-5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.005]">
    <div className="mb-3 flex items-start gap-3">
      {icon && (
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mt-1">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <label
          htmlFor={id}
          className="block text-lg font-semibold text-gray-800 dark:text-gray-100"
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
    {React.cloneElement(children, { id })}
  </div>
);

const SettingsPageHome = () => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    theme: "system",
    notifications: true,
    emailNotifications: true,
    pushNotifications: true,
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    youtubeConnected: false,
    youtubeChannel: null,
    autoUpload: false,
    defaultVisibility: "private",
    uploadQuality: "hd1080",
    twoFactorEnabled: false,
    backupEmail: "",
    dataExport: false,
    autoPlayVideos: true,
    videoQuality: "auto",
    downloadQuality: "hd",
    darkModeSchedule: "system",
    darkModeStart: "20:00",
    darkModeEnd: "07:00",
  });

  const [uiState, setUiState] = useState({
    showDeleteModal: false,
    showLogoutModal: false,
    loading: true,
    saveLoading: false,
    deleteLoading: false,
    authChecked: false,
    showPassword: false,
    youtubeLoading: false,
    activeTab: "account",
    showBackupEmailField: false,
    showTwoFactorSetup: false,
    twoFactorCode: "",
    twoFactorSecret: "",
    showPasswordStrength: false,
    passwordStrength: 0,
    qrCode: "", // Added for QR code
  });

  const navigate = useNavigate();
  const { setThemePreference } = useContext(ThemeContext);
  const { youtubeLoading } = uiState;
  // Add message listener for YouTube connection
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "YOUTUBE_CONNECTED") {
        if (event.data.success) {
          checkYouTubeStatus();
          toast.success("YouTube connected successfully!");
        } else {
          toast.error(event.data.error || "Failed to connect YouTube");
        }
        setUiState(prev => ({ ...prev, youtubeLoading: false }));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Calculate password strength
  const calculatePasswordStrength = useCallback((password) => {
    if (!password) return 0;
    
    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    // Character variety
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  }, []);

  // Authentication verification
  const verifyAuth = useCallback(async () => {
    setUiState(prev => ({ ...prev, loading: true }));

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.warn("No access token found, redirecting...");
        setUiState(prev => ({ ...prev, loading: false }));
        navigate("/login");
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await API.get('/users/me');
      const user = response.data.data;

      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        theme: user.settings?.theme || "system",
        notifications: user.settings?.notifications ?? true,
        emailNotifications: user.settings?.emailNotifications ?? true,
        pushNotifications: user.settings?.pushNotifications ?? true,
        language: user.settings?.language || "en",
        timezone: user.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        youtubeConnected: user.youtube?.connected || false,
        youtubeChannel: user.youtube?.channel || null,
        autoUpload: user.youtube?.autoUpload || false,
        defaultVisibility: user.youtube?.defaultVisibility || "private",
        uploadQuality: user.youtube?.uploadQuality || "hd1080",
        twoFactorEnabled: user.settings?.twoFactorEnabled || false,
        backupEmail: user.settings?.backupEmail || "",
        dataExport: user.settings?.dataExport || false,
        autoPlayVideos: user.settings?.autoPlayVideos ?? true,
        videoQuality: user.settings?.videoQuality || "auto",
        downloadQuality: user.settings?.downloadQuality || "hd",
        darkModeSchedule: user.settings?.darkModeSchedule || "system",
        darkModeStart: user.settings?.darkModeStart || "20:00",
        darkModeEnd: user.settings?.darkModeEnd || "07:00"
      });

      setUiState(prev => ({ ...prev, authChecked: true, loading: false }));

    } catch (error) {
      console.error("Authentication error:", error);
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      setUiState(prev => ({ ...prev, loading: false }));
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const checkYouTubeStatus = async () => {
    try {
      const response = await API.get('/users/check-youtube-status');
      const data = response.data.data;
      
      setFormData(prev => ({
        ...prev,
        youtubeConnected: data.youtube.connected || false,
        youtubeChannel: data.youtube.channel || null,
        autoUpload: data.youtube.autoUpload || false,
        defaultVisibility: data.youtube.defaultVisibility || "private",
        uploadQuality: data.youtube.uploadQuality || "hd1080"
      }));
    } catch (error) {
      console.error("Failed to check YouTube status:", error);
    }
  };

  const disconnectYouTube = async () => {
    setUiState(prev => ({ ...prev, youtubeLoading: true }));
    try {
      await API.post('/users/disconnect-youtube');
      setFormData(prev => ({
        ...prev,
        youtubeConnected: false,
        youtubeChannel: null,
        autoUpload: false
      }));
      toast.success("Disconnected from YouTube successfully");
    } catch (error) {
      toast.error("Failed to disconnect YouTube account");
      console.error("Failed to disconnect YouTube account:", error);
    } finally {
      setUiState(prev => ({ ...prev, youtubeLoading: false }));
    }
  };

  const handleInputChange = (e) => {
    // Handle both event objects and direct boolean values (from Switch components)
    const name = e.target?.name || e.name;
    const value = e.target?.value ?? e.target?.checked ?? e;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If theme is changed, update it immediately
    if (name === 'theme') {
      setThemePreference(value);
    }

    // Calculate password strength when password changes
    if (name === 'password') {
      setUiState(prev => ({
        ...prev,
        passwordStrength: calculatePasswordStrength(value),
        showPasswordStrength: value.length > 0
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setUiState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const toggleBackupEmailField = () => {
    setUiState(prev => ({ ...prev, showBackupEmailField: !prev.showBackupEmailField }));
  };

  // Setup 2FA (generate QR + secret)
  const setupTwoFactorAuth = async () => {
    try {
      const response = await API.post("/users/setup-2fa");
      const data = response.data.data;

      setUiState(prev => ({
        ...prev,
        showTwoFactorSetup: true,
        twoFactorSecret: data.secret || "",
        // twoFactorCode: "",
        qrCode: data.qrCode || "",
      }));
    } catch (error) {
      toast.error("Failed to setup two-factor authentication");
      console.error("2FA setup error:", error);
    }
  };

  // Verify 2FA code entered by user
  const verifyTwoFactorCode = async () => {
    try {
      await API.post("/users/verify-2fa", {
        code: uiState.twoFactorCode,
        secret: uiState.twoFactorSecret // Include the secret for verification
      });

      setFormData(prev => ({ ...prev, twoFactorEnabled: true }));
      setUiState(prev => ({ ...prev, showTwoFactorSetup: false }));

      toast.success("Two-factor authentication enabled successfully!");
    } catch (error) {
      console.error("Failed to verify 2FA code:", error);
      toast.error("Invalid verification code");
    }
  };

  // Disable 2FA
  const disableTwoFactorAuth = async () => {
    try {
      await API.post("/users/disable-2fa");
      setFormData(prev => ({ ...prev, twoFactorEnabled: false }));
      toast.success("Two-factor authentication disabled");
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      toast.error("Failed to disable two-factor authentication");
    }
  };

const handleSave = async () => {
    if (!formData.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    if (formData.password && formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setUiState((prev) => ({ ...prev, saveLoading: true }));

    try {
      await API.put("/users/update-account", {
        username: formData.username,
        email: formData.email,
        password: formData.password || undefined,
        backupEmail: formData.backupEmail || undefined,
      });

      await API.put("/users/settings", {
        theme: formData.theme,
        notifications: Boolean(formData.notifications),
        emailNotifications: Boolean(formData.emailNotifications),
        pushNotifications: Boolean(formData.pushNotifications),
        language: formData.language,
        timezone: formData.timezone,
        dataExport: Boolean(formData.dataExport),
        autoPlayVideos: Boolean(formData.autoPlayVideos),
        videoQuality: formData.videoQuality,
        downloadQuality: formData.downloadQuality,
        darkModeSchedule: formData.darkModeSchedule,
        darkModeStart: formData.darkModeStart,
        darkModeEnd: formData.darkModeEnd,
        youtube: {
          autoUpload: Boolean(formData.autoUpload),
          defaultVisibility: formData.defaultVisibility,
          uploadQuality: formData.uploadQuality,
        },
        twoFactorEnabled: Boolean(formData.twoFactorEnabled),
      });

      if (formData.password) {
        setFormData((prev) => ({ ...prev, password: "" }));
        setUiState((prev) => ({ ...prev, showPasswordStrength: false }));
      }

      toast.success("Settings saved successfully!", {
        position: "bottom-center",
        style: {
          background: "#10B981",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px",
        },
      });
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.message || "Failed to save settings", {
        position: "bottom-center",
      });
    } finally {
      setUiState((prev) => ({ ...prev, saveLoading: false }));
    }
  };


  const handleDeleteAccount = async () => {
    setUiState(prev => ({ ...prev, deleteLoading: true }));
    
    try {
      await API.delete('/users/delete');
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setUiState(prev => ({ 
        ...prev, 
        deleteLoading: false,
        showDeleteModal: false 
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    navigate("/");
    toast.success("Logged out successfully");
  };

  const exportUserData = async () => {
    try {
      const response = await API.get('/users/export');
      const data = response.data.data;
      
      // Create a download link for the data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export user data");
    }
  };

  const PasswordStrengthIndicator = ({ strength }) => {
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    const strengthColors = [
      "bg-red-500", 
      "bg-orange-500", 
      "bg-yellow-500", 
      "bg-blue-500", 
      "bg-green-500", 
      "bg-green-600"
    ];
    
    return (
      <div className="mt-2">
        <div className="flex gap-1 h-1.5 mb-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full ${i < strength ? strengthColors[i] : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {strengthLabels[strength]} {strength > 0 && `(${strength}/5)`}
        </p>
      </div>
    );
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <LockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login or sign up to access your settings
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (uiState.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4 p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your account preferences and connected services
        </p>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
       <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
  {["account", "preferences", "integrations", "security", "danger"].map((tab) => (
    <button
      key={tab}
      aria-current={uiState.activeTab === tab ? "page" : undefined}
      className={`px-4 py-2 font-medium text-sm capitalize rounded-t-lg transition-colors ${
        uiState.activeTab === tab
          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
      onClick={() => setUiState((prev) => ({ ...prev, activeTab: tab }))}
    >
      {tab}
    </button>
  ))}
</div>

        {/* Loading State */}
        {uiState.loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Account Tab */}
        {uiState.activeTab === "account" && !uiState.loading && (
          <div className="space-y-6">
            <SettingItem
              label="Profile Information"
              description="Update your username and email address"
              icon={<UserIcon className="w-5 h-5" />}
              id="profile"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Change Password
                  </label>
                  <div className="relative">
                    <input
                      type={uiState.showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {uiState.showPassword ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {uiState.showPasswordStrength && (
                    <PasswordStrengthIndicator strength={uiState.passwordStrength} />
                  )}
                </div>
              </div>
            </SettingItem>

            <SettingItem
              label="Timezone"
              description="Set your local timezone for proper time displays"
              icon={<ClockIcon className="w-5 h-5" />}
              id="timezone"
            >
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
              >
                {Intl.supportedValuesOf('timeZone').map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </SettingItem>
          </div>
        )}

        {/* Preferences Tab */}
        {uiState.activeTab === "preferences" && !uiState.loading && (
          <div className="space-y-6">
            <SettingItem
              label="Appearance"
              description="Customize how the app looks"
              icon={<PaletteIcon className="w-5 h-5" />}
              id="appearance"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Theme
                  </label>
                  <div className="flex gap-4">
                    {[
                      { value: "light", label: "Light", icon: <SunIcon className="w-4 h-4" /> },
                      { value: "dark", label: "Dark", icon: <MoonIcon className="w-4 h-4" /> },
                      { value: "system", label: "System", icon: <ComputerDesktopIcon className="w-4 h-4" /> },
                    ].map((option) => (
                      <label 
                        key={option.value} 
                        className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.theme === option.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={option.value}
                          checked={formData.theme === option.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className="mb-2 text-blue-500 dark:text-blue-400">
                          {option.icon}
                        </span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.theme === "system" && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                           Dark Mode Schedule
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Schedule Type
                        </label>
                        <select
                          name="darkModeSchedule"
                          value={formData.darkModeSchedule}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        >
                          <option value="system">Follow System</option>
                          <option value="custom">Custom Schedule</option>
                          <option value="always">Always Dark</option>
                          <option value="never">Never Dark</option>
                        </select>
                      </div>
                      
                      {formData.darkModeSchedule === "custom" && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              name="darkModeStart"
                              value={formData.darkModeStart}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              name="darkModeEnd"
                              value={formData.darkModeEnd}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </SettingItem>

<SettingItem
  label="Notifications"
  description="Manage how you receive notifications"
  icon={<BellIcon className="w-5 h-5" />}
  id="notifications"
>
  <div className="space-y-4">
    {/* Master Switch */}
    <Switch.Group as="div" className="flex items-center justify-between">
      <Switch.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Enable Notifications
      </Switch.Label>
      <Switch
        checked={formData.notifications}
        onChange={(value) => handleInputChange({ name: "notifications", value })}
        className={`${
          formData.notifications ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        <span
          className={`${
            formData.notifications ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform`}
        />
      </Switch>
    </Switch.Group>

    {/* Sub-switches visible only if notifications enabled */}
    {formData.notifications && (
      <div className="space-y-4 pl-2 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
        <Switch.Group as="div" className="flex items-center justify-between">
          <Switch.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Notifications
          </Switch.Label>
          <Switch
            checked={formData.emailNotifications}
            onChange={(value) =>
              handleInputChange({ name: "emailNotifications", value })
            }
            className={`${
              formData.emailNotifications
                ? "bg-blue-600"
                : "bg-gray-300 dark:bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span
              className={`${
                formData.emailNotifications ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform`}
            />
          </Switch>
        </Switch.Group>

        <Switch.Group as="div" className="flex items-center justify-between">
          <Switch.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Push Notifications
          </Switch.Label>
          <Switch
            checked={formData.pushNotifications}
            onChange={(value) =>
              handleInputChange({ name: "pushNotifications", value })
            }
            className={`${
              formData.pushNotifications
                ? "bg-blue-600"
                : "bg-gray-300 dark:bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span
              className={`${
                formData.pushNotifications ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform`}
            />
          </Switch>
        </Switch.Group>
      </div>
    )}
  </div>
</SettingItem>


            <SettingItem
              label="Video Preferences"
              description="Customize your video experience"
              icon={<YoutubeIcon className="w-5 h-5" />}
              id="video-preferences"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Video Quality
                  </label>
                  <select
                    name="videoQuality"
                    value={formData.videoQuality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  >
                    <option value="auto">Auto (Recommended)</option>
                    <option value="sd">SD (480p)</option>
                    <option value="hd">HD (720p)</option>
                    <option value="fullhd">Full HD (1080p)</option>
                    <option value="4k">4K (2160p)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Download Quality
                  </label>
                  <select
                    name="downloadQuality"
                    value={formData.downloadQuality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  >
                    <option value="sd">SD (480p)</option>
                    <option value="hd">HD (720p)</option>
                    <option value="fullhd">Full HD (1080p)</option>
                  </select>
                </div>

                <Switch.Group>
                  <div className="flex items-center justify-between">
                    <Switch.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto-play Videos
                    </Switch.Label>
                    <Switch
                      checked={formData.autoPlayVideos}
                      onChange={(value) => handleInputChange({ name: "autoPlayVideos", value })}
                      className={`${
                        formData.autoPlayVideos ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                      <span
                        className={`${
                          formData.autoPlayVideos ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </Switch.Group>
              </div>
            </SettingItem>

            <SettingItem
              label="Language"
              description="Choose your preferred language"
              icon={<GlobeIcon className="w-5 h-5" />}
              id="language"
            >
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </SettingItem>
          </div>
        )}

        {/* Integrations Tab */}
        {uiState.activeTab === "integrations" && !uiState.loading && (
          <div className="space-y-6">
            <SettingItem
              label="YouTube Integration"
              description="Connect your YouTube account to upload videos directly"
              icon={<YoutubeIcon className="w-5 h-5" />}
              id="youtube-integration"
            >
              <div className="space-y-4">
                {formData.youtubeConnected ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-green-700 dark:text-green-400">
                          Connected to YouTube
                        </span>
                      </div>
                      <button
                        onClick={disconnectYouTube}
                        disabled={uiState.youtubeLoading}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center"
                      >
                        {uiState.youtubeLoading ? (
                          <Loader2Icon className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <Trash2Icon className="w-4 h-4 mr-1" />
                        )}
                        Disconnect
                      </button>
                    </div>

                    {formData.youtubeChannel && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Connected channel: <span className="font-medium">{formData.youtubeChannel.name}</span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 pt-2">
                      <Switch.Group>
                        <div className="flex items-center justify-between">
                          <Switch.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Auto-upload to YouTube
                          </Switch.Label>
                          <Switch
                            checked={formData.autoUpload}
                            onChange={(value) => handleInputChange({ name: "autoUpload", value })}
                            className={`${
                              formData.autoUpload ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                          >
                            <span
                              className={`${
                                formData.autoUpload ? 'translate-x-6' : 'translate-x-1'
                              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                          </Switch>
                        </div>
                      </Switch.Group>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Default Visibility
                        </label>
                        <select
                          name="defaultVisibility"
                          value={formData.defaultVisibility}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                          <option value="private">Private</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="public">Public</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Upload Quality
                        </label>
                        <select
                          name="uploadQuality"
                          value={formData.uploadQuality}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                          <option value="hd720">HD (720p)</option>
                          <option value="hd1080">Full HD (1080p)</option>
                          <option value="4k">4K (2160p)</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <YouTubeConnect 
                    setFormData={setFormData}
                    youtubeLoading={uiState.youtubeLoading}
                    setYoutubeLoading={(loading) => setUiState(prev => ({ ...prev, youtubeLoading: loading }))}
                  />
                )}
              </div>
            </SettingItem>
          </div>
        )}

        {/* Security Tab */}
        {uiState.activeTab === "security" && !uiState.loading && (
          <div className="space-y-6">
            <SettingItem
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              icon={<ShieldIcon className="w-5 h-5" />}
              id="2fa"
            >
              <div className="space-y-4">
                {formData.twoFactorEnabled ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          Two-factor authentication is enabled
                        </span>
                      </div>
                      <button
                        onClick={disableTwoFactorAuth}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Disable
                      </button>
                    </div>
                  </div>
                ) : uiState.showTwoFactorSetup ? (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Scan the QR code with your authenticator app and enter the code to verify:
                    </p>
                    
                    {uiState.qrCode && (
                      <div className="flex justify-center">
                        <img src={uiState.qrCode} alt="QR Code" className="w-32 h-32" />
                      </div>
                    )}
                    
                    {/* <div className="text-center text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {uiState.twoFactorSecret}
                    </div> */}
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={uiState.twoFactorCode}
                        onChange={(e) => setUiState(prev => ({ ...prev, twoFactorCode: e.target.value }))}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={verifyTwoFactorCode}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                      >
                        Verify & Enable
                      </button>
                      <button
                        onClick={() => setUiState(prev => ({ ...prev, showTwoFactorSetup: false }))}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.
                    </p>
                    <button
                      onClick={setupTwoFactorAuth}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      Set up two-factor authentication
                    </button>
                  </div>
                )}
              </div>
            </SettingItem>

            <SettingItem
              label="Backup Email"
              description="Add a backup email for account recovery"
              icon={<MailIcon className="w-5 h-5" />}
              id="backup-email"
            >
              <div className="space-y-4">
                {formData.backupEmail ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-green-700 dark:text-green-400 text-sm">
                      Backup email: <span className="font-medium">{formData.backupEmail}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No backup email configured. Add one for account recovery.
                  </p>
                )}
                
                {uiState.showBackupEmailField ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      name="backupEmail"
                      value={formData.backupEmail}
                      onChange={handleInputChange}
                      placeholder="Enter backup email"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={toggleBackupEmailField}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={toggleBackupEmailField}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {formData.backupEmail ? 'Change' : 'Add'} Backup Email
                  </button>
                )}
              </div>
            </SettingItem>

            <SettingItem
              label="Data Export"
              description="Download a copy of your data"
              icon={<DownloadIcon className="w-5 h-5" />}
              id="data-export"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can request a copy of all your personal data stored on our servers.
                </p>
                <button
                  onClick={exportUserData}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Export My Data
                </button>
              </div>
            </SettingItem>

            <SettingItem
              label="Active Sessions"
              description="Manage your active login sessions"
              icon={<LogOutIcon className="w-5 h-5" />}
              id="active-sessions"
            >
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Current Session
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {navigator.userAgent}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Last active: Just now
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                      This device
                    </span>
                  </div>
                </div>
                
                <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1">
                  <LogOutIcon className="w-4 h-4" />
                  Log out all other sessions
                </button>
              </div>
            </SettingItem>
          </div>
        )}

        {/* Danger Zone Tab */}
        {uiState.activeTab === "danger" && !uiState.loading && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <AlertTriangleIcon className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-red-700 dark:text-red-400 text-sm mb-4">
                These actions are irreversible. Please proceed with caution.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                    Log out of your account
                  </h4>
                  <p className="text-red-600 dark:text-red-400 text-sm mb-3">
                    You will need to sign in again to access your account.
                  </p>
                  <button
                    onClick={() => setUiState(prev => ({ ...prev, showLogoutModal: true }))}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 text-sm flex items-center gap-2"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Log Out
                  </button>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                    Delete your account
                  </h4>
                  <p className="text-red-600 dark:text-red-400 text-sm mb-3">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => setUiState(prev => ({ ...prev, showDeleteModal: true }))}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center gap-2"
                  >
                    <Trash2Icon className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={uiState.saveLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uiState.saveLoading ? (
              <Loader2Icon className="w-5 h-5 animate-spin" />
            ) : (
              <SaveIcon className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {uiState.showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Delete Account
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setUiState(prev => ({ ...prev, showDeleteModal: false }))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={uiState.deleteLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {uiState.deleteLoading && <Loader2Icon className="w-4 h-4 animate-spin" />}
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <AnimatePresence>
        {uiState.showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <LogOutIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Log Out
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to log out? You'll need to sign in again to access your account.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setUiState(prev => ({ ...prev, showLogoutModal: false }))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add the missing GlobeIcon component
const GlobeIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default SettingsPageHome;

