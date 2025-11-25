// src/utils/api.js
import axios from "axios";

const businessServiceBaseURL =
  import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";

const API = axios.create({
  baseURL: `${businessServiceBaseURL}/api`,
  // "/api"
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
