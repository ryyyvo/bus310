import { useState } from 'react';
import { apiPut } from '../util/api-helper';
import type { UpdateTripRequest, Trip } from '../types';

/**
 * Hook to update a trip
 */
export function useUpdateTrip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTrip = async (tripId: string, updates: UpdateTripRequest): Promise<Trip | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPut<Trip>(`/trips/${tripId}`, updates);
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
    updateTrip,
  };
}
