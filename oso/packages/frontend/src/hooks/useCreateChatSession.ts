import { useState } from "react";
import { apiPost } from "../util/api-helper";
import type { CreateChatSessionResponse } from "../types";

/**
 * Hook to create a new chat session
 * Note: userId is automatically derived from auth token
 */
export function useCreateChatSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createChatSession = async (): Promise<CreateChatSessionResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<CreateChatSessionResponse>("/chat/sessions", {});
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
    createChatSession,
  };
}
