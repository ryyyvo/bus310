import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { GetChatSessionResponse } from '../types';

/**
 * Hook to get a chat session by ID
 */
export function useGetChatSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getChatSession = async (sessionId: string): Promise<GetChatSessionResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<GetChatSessionResponse>(`/chat/sessions/${sessionId}`);
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
    getChatSession,
  };
}
