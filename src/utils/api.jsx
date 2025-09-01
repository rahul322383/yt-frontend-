import axios from "axios";

const baseURL = "http://localhost:8000/api/v1";

const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized, please login again.");
    }
    return Promise.reject(error);
  }
);

export default API;
