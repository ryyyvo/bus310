import { useState } from 'react';
import { apiPost } from '../util/api-helper';
import type { GenerateGearListRequest, GenerateGearListResponse } from '../types';

/**
 * Hook to generate AI gear list recommendations
 */
export function useGenerateGearList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateGearList = async (data: GenerateGearListRequest): Promise<GenerateGearListResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost<GenerateGearListResponse>('/trips/generate/gear-list', data);
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
    generateGearList,
  };
}
