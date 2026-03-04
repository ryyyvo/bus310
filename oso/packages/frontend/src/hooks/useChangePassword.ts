import { useState } from 'react';
import { apiPut } from '../util/api-helper';
import type { ChangePasswordRequest, MessageResponse } from '../types';

/**
 * Hook to change user password
 */
export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const changePassword = async (data: ChangePasswordRequest): Promise<MessageResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPut<MessageResponse>('/auth/password', data);
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
    changePassword,
  };
}
