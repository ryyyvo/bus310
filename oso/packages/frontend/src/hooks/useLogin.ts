import { useState } from 'react';
import { apiPost } from '../util/api-helper';
import type { LoginRequest, AuthResponse } from '../types';

/**
 * Hook to login user
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (data: LoginRequest): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost<AuthResponse>('/auth/login', data);

      // Store token and user in localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    login,
  };
}
