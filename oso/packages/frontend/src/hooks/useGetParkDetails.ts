import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { Park } from '../types';

/**
 * Hook to get park details by park code
 */
export function useGetParkDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getParkDetails = async (parkCode: string): Promise<Park | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Park>(`/campsites/parks/${parkCode}`);
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
    getParkDetails,
  };
}
