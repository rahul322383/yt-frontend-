

// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import API from "../utils/axiosInstance.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    isAuthenticated: false,
    loading: true,
    twoFactorEnabled: false, // Add 2FA status to auth state
  });

  // 🔹 Clear everything when unauthenticated
  const clearAuthData = useCallback(() => {
    try {
      Cookies.remove("accessToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
    } catch (e) {
      console.warn("Failed to clear auth data:", e);
    }
    setAuth({ user: null, isAuthenticated: false, loading: false, twoFactorEnabled: false });
  }, []);

  // Login function
  const login = useCallback((user, accessToken, refreshToken) => {
    try {
      // save tokens
      Cookies.set("accessToken", accessToken, { expires: 7 });
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      // save user
      localStorage.setItem("userData", JSON.stringify(user));

      // update state
      setAuth({
        user,
        isAuthenticated: true,
        loading: false,
        twoFactorEnabled: user.twoFactorEnabled || false, // Set 2FA status from user data
      });
    } catch (e) {
      console.error("Login failed:", e);
    }
  }, []);

  // Update 2FA status
  const updateTwoFactorStatus = useCallback((status) => {
    setAuth(prev => ({
      ...prev,
      twoFactorEnabled: status,
      user: prev.user ? {...prev.user, twoFactorEnabled: status} : null
    }));
    
    // Also update in localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      user.twoFactorEnabled = status;
      localStorage.setItem("userData", JSON.stringify(user));
    }
  }, []);

  // 🔹 Logout helper
  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  // 🔹 Check authentication on load
  const checkAuth = useCallback(async () => {
    try {
      const token =
        Cookies.get("accessToken") || localStorage.getItem("accessToken");

      if (!token) {
        clearAuthData();
        return;
      }

      const { data } = await API.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.data) {
        setAuth({ 
          user: data.data, 
          isAuthenticated: true, 
          loading: false,
          twoFactorEnabled: data.data.twoFactorEnabled || false 
        });
        localStorage.setItem("userData", JSON.stringify(data.data));
      } else {
        clearAuthData();
      }
    } catch (err) {
      console.error("Auth check error:", err);
      clearAuthData();
    }
  }, [clearAuthData]);

  // 🔹 Run checkAuth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        clearAuthData,
        checkAuth,
        logout,
        login,
        updateTwoFactorStatus, // Add this to update 2FA status
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Easy hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};