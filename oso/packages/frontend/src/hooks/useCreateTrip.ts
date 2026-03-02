import { useState } from 'react';
import { apiPost } from '../util/api-helper';
import type { CreateTripRequest, Trip } from '../types';

/**
 * Hook to create a new trip
 */
export function useCreateTrip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTrip = async (tripData: CreateTripRequest): Promise<Trip | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<Trip>('/trips', tripData);
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
    createTrip,
  };
}
