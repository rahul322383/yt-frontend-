
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
  });

  // 🔹 Clear everything when unauthenticated
  const clearAuthData = useCallback(() => {
    try {
      Cookies.remove("accessToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
    } catch (e) {
      console.warn("Failed to clear auth data:", e);
    }
    setAuth({ user: null, isAuthenticated: false, loading: false });
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
        setAuth({ user: data.data, isAuthenticated: true, loading: false });
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
        logout, // ✅ available everywhere
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Easy hook
export const useAuth = () => useContext(AuthContext);
