import { useState } from 'react';
import { apiPost } from '../util/api-helper';
import type { RegisterRequest, AuthResponse } from '../types';

/**
 * Hook to register a new user
 */
export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const register = async (data: RegisterRequest): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost<AuthResponse>('/auth/register', data);

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
    register,
  };
}
