import axios from "axios";
import storage from "./storage";

// Base URL for production
const BASE_URL = "https://allumnova.cloud/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add Bearer token to requests
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
