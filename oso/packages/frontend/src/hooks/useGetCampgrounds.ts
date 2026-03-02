import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { GetCampgroundsResponse } from '../types';

/**
 * Hook to get campgrounds for a park
 */
export function useGetCampgrounds() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCampgrounds = async (parkCode: string): Promise<GetCampgroundsResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<GetCampgroundsResponse>(`/campsites/parks/${parkCode}/campgrounds`);
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
    getCampgrounds,
  };
}
