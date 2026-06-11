/**
 * Axios Instance — Configured HTTP Client
 *
 * Pre-configured Axios instance with:
 *   - Base URL from API_BASE_URL constant
 *   - JSON content type header
 *   - Request interceptor: attaches JWT token from localStorage as Bearer auth
 *   - Response interceptor: auto-logs out on 401 (token expired/invalid),
 *     redirects to /login?expired=true, and normalizes error messages
 *     from API responses into readable Error objects
 */

import axios from 'axios';
import { API_BASE_URL } from './constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outbound request interceptor for JWT authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('udhar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthenticated 401 redirects and global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns a 401 (Unauthorized) status, log out the user automatically
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('udhar_token');
      localStorage.removeItem('udhar_user');
      // If we are in browser environment, redirect to login page
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    
    // Propagate standard API descriptive error
    const message = error.response?.data?.error || error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
