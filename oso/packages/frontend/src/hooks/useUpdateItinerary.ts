import { useState } from 'react';
import { apiPut } from '../util/api-helper';
import type { ItineraryDay, Trip } from '../types';

/**
 * Hook to update trip itinerary
 */
export function useUpdateItinerary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateItinerary = async (tripId: string, itinerary: ItineraryDay[]): Promise<Trip | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPut<Trip>(`/trips/${tripId}/itinerary`, { itinerary });
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
    updateItinerary,
  };
}
