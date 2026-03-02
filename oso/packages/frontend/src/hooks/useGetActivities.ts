import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { GetActivitiesResponse } from '../types';

/**
 * Hook to get all available activities
 */
export function useGetActivities() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getActivities = async (): Promise<GetActivitiesResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<GetActivitiesResponse>('/campsites/activities');
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
    getActivities,
  };
}
