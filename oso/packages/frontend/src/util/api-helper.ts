import axios, { AxiosRequestConfig } from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';

    // Handle 401 unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Optionally redirect to login or dispatch logout event
      window.dispatchEvent(new Event('auth:logout'));
    }

    return Promise.reject(new Error(message));
  }
);

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const response = await apiClient.get<T>(endpoint, { params });
  return response.data;
}

/**
 * POST request
 */
export async function apiPost<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<T>(endpoint, data, config);
  return response.data;
}

/**
 * PUT request
 */
export async function apiPut<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<T>(endpoint, data, config);
  return response.data;
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiClient.delete<T>(endpoint);
  return response.data;
}

export default apiClient;
