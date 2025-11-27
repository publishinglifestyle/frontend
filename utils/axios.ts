import axios from "axios";
import Cookie from "js-cookie";

import { baseURL } from "@/constant/urls";

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to always use the latest token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookie.get("authToken");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors (expired/invalid token)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout if user was authenticated AND got a 401
    // Don't logout on auth endpoints (login, signup, etc.)
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    const hadToken = Cookie.get("authToken");

    if (error.response?.status === 401 && hadToken && !isAuthEndpoint) {
      // Clear all auth data
      Cookie.remove("authToken");
      Cookie.remove("user_id");
      Cookie.remove("user_name");
      localStorage.clear();

      // Redirect to home page
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
