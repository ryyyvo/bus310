import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { ProfileResponse } from '../types';

/**
 * Hook to get current user profile
 */
export function useGetProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getProfile = async (): Promise<ProfileResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet<ProfileResponse>('/auth/profile');

      // Update stored user data
      if (response.user) {
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
    getProfile,
  };
}
