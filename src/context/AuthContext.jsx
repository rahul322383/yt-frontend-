// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import API from "../utils/axiosInstance.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  const clearAuthData = () => {
    Cookies.remove("accessToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    setAuth({ user: null, isAuthenticated: false, loading: false });
  };

  const checkAuth = async () => {
    try {
      const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");
     
      if (!token) {
        clearAuthData();
        return;
      }

      const { data } = await API.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, clearAuthData, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
