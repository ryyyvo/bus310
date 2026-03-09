import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { GetUserTripsResponse } from '../types';

/**
 * Hook to get all trips for the authenticated user
 * Note: userId is automatically derived from auth token
 */
export function useGetUserTrips() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getUserTrips = async (): Promise<GetUserTripsResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<GetUserTripsResponse>('/trips');
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
    getUserTrips,
  };
}
