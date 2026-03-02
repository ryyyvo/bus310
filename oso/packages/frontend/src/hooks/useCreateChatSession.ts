import { useState } from "react";
import { apiPost } from "../util/api-helper";
import type {
  CreateChatSessionRequest,
  CreateChatSessionResponse,
} from "../types";

/**
 * Hook to create a new chat session
 */
export function useCreateChatSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createChatSession = async (
    userId: string,
  ): Promise<CreateChatSessionResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<CreateChatSessionResponse>("/chat/sessions", {
        userId,
      } as CreateChatSessionRequest);
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
