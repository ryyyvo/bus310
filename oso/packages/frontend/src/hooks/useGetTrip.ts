import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { Trip } from '../types';

/**
 * Hook to get a trip by ID
 */
export function useGetTrip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getTrip = async (tripId: string): Promise<Trip | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Trip>(`/trips/${tripId}`);
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
    getTrip,
  };
}
