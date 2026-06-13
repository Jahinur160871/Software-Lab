import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true  // Important for cookies!
});

// Add token to requests (cookie is sent automatically, this is backup)
api.interceptors.request.use(
  (config) => {
    // Cookie is sent automatically with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;