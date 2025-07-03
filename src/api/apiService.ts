// src/api/apiService.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// Ensure VITE_API_URL is set in your .env file in the project root
// Example: VITE_API_URL=https://api.logipilot.dev
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'; // Fallback for local dev if .env is missing

console.log(`API Service initialized with base URL: ${API_BASE_URL}`);

const apiService: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // 'Accept': 'application/json', // Usually default
  },
});

// Request Interceptor to add JWT token
apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken'); // Or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for global error handling / logging
apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // You can transform data here before it's passed to .then()
    return response;
  },
  (error: AxiosError<any>) => { // Specify `any` for error.response.data if structure is unknown/varied
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    console.error('API Error:', error.response?.status, error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const errorMessage = error.response.data?.error || error.response.data?.message || error.message;

      if (status === 401) {
        // Unauthorized: Token might be invalid or expired
        toast.error('Session expired.', { description: 'Please log in again.' });
        // TODO: Add logic to clear token and redirect to login
        // localStorage.removeItem('authToken');
        // window.location.href = '/login'; // Or use React Router navigation
      } else if (status === 403) {
        // Forbidden
        toast.error('Access Denied.', { description: 'You do not have permission to perform this action.' });
      } else if (status === 404) {
        // Not Found
        toast.error('Resource Not Found.', { description: `The requested resource could not be found.` });
      } else if (status >= 500) {
        // Server error
        toast.error('Server Error.', { description: 'An unexpected error occurred on the server. Please try again later.' });
      } else if (errorMessage) {
        // For other client errors with specific messages from backend (e.g., validation)
        toast.error('Error', { description: errorMessage });
      } else {
        toast.error('API Request Failed', { description: `Error: ${error.message}` });
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network Error', { description: 'Could not connect to the server. Please check your internet connection.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('Request Setup Error', { description: `Error: ${error.message}` });
    }
    return Promise.reject(error);
  }
);

export default apiService;
