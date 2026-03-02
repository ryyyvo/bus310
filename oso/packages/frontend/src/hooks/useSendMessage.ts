import { useState } from "react";
import { apiPost } from "../util/api-helper";
import type { SendMessageRequest, SendMessageResponse } from "../types";

/**
 * Hook to send a message in a chat session
 */
export function useSendMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async (
    sessionId: string,
    message: string,
    constraints?: SendMessageRequest["constraints"],
  ): Promise<SendMessageResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<SendMessageResponse>(
        `/chat/sessions/${sessionId}/messages`,
        {
          message,
          constraints,
        } as SendMessageRequest,
      );
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
    sendMessage,
  };
}
