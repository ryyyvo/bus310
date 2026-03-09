import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { GetChatSessionResponse } from '../types';

/**
 * Hook to get all chat sessions for the authenticated user
 * Note: userId is automatically derived from auth token
 */
export function useGetUserChatSessions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getUserChatSessions = async (): Promise<GetChatSessionResponse[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<GetChatSessionResponse[]>('/chat/sessions');
      return data;
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
    getUserChatSessions,
  };
}
