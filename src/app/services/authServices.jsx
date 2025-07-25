// src/services/authService.js
import axios from "../utils/axiosInstance";

export const login = (data) => axios.post("/users/login", data);
export const signup = (data) => axios.post("/users/register", data);

// Optional for token refresh
export const refreshToken = () => axios.post("/users/refresh-token");
