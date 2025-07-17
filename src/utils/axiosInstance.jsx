// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1", // your backend base
  withCredentials: true,
});

export default axiosInstance;
