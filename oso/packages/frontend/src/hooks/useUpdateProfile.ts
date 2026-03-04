import { useState } from 'react';
import { apiPut } from '../util/api-helper';
import type { UpdateProfileRequest, User } from '../types';

interface UpdateProfileResponse {
  message: string;
  user: User;
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPut<UpdateProfileResponse>('/auth/profile', data);

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
    updateProfile,
  };
}
