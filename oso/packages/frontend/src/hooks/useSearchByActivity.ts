import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { SearchByActivityResponse } from '../types';

/**
 * Hook to search parks by activity
 */
export function useSearchByActivity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchByActivity = async (activityId: string, state?: string): Promise<SearchByActivityResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (state) params.state = state;

      const data = await apiGet<SearchByActivityResponse>(`/campsites/activities/${activityId}/parks`, params);
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
    searchByActivity,
  };
}
