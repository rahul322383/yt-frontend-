// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:8000/api/v1",
//   withCredentials: true,
// });

// export default API;


import axios from "axios";

// Get the API base URL from environment variables (use .env for different environments)
const baseURL =  "http://localhost:8000/api/v1";

// Create the Axios instance
const API = axios.create({
  baseURL,
  withCredentials: true, // Ensures that cookies are included for cross-origin requests (if using sessions)
});

// Add a request interceptor (Optional, for auth token handling)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Or get from a cookie/session storage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Attach JWT token to requests if needed
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
API.interceptors.response.use(
  (response) => response, // Simply return the response data on success
  (error) => {
    // Handle errors globally (e.g., if the user is unauthorized, redirect to login page)
    if (error.response?.status === 401) {
      // Handle token expiration or unauthorized status (e.g., logout user)
      console.error("Unauthorized, please login again.");
      // You can also redirect to login page here
    }
    return Promise.reject(error); // Return the error to be handled in the component
  }
);

export default API;
