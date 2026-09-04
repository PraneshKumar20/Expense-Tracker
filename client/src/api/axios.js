import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? "/api"
    : "http://localhost:5000/api"
);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-type": "application/json"
  }
});

export default axiosInstance;
