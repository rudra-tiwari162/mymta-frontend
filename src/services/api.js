import axios from "axios";

const tenant = window.location.hostname.split(".")[0];


const api = axios.create({
  baseURL: `http://${window.location.hostname}:8000`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token_${tenant}"); // ✅ correct key

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
