import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token if available
api.interceptors.request.use((config) => {
  let token = null;
  // Try to parse token from Zustand persist
  try {
    const persistState = localStorage.getItem('takwit_auth');
    if (persistState) {
      const parsed = JSON.parse(persistState);
      token = parsed?.state?.token;
    }
  } catch(e) {
    console.error("Error parsing auth token", e);
  }
  
  // Fallback
  if (!token) {
    token = localStorage.getItem('takwit_access_token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
