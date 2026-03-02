import { useState } from 'react';
import { apiDelete } from '../util/api-helper';
import type { DeleteTripResponse } from '../types';

/**
 * Hook to delete a trip
 */
export function useDeleteTrip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTrip = async (tripId: string): Promise<DeleteTripResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiDelete<DeleteTripResponse>(`/trips/${tripId}`);
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
    deleteTrip,
  };
}
