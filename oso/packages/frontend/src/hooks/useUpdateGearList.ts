import { useState } from 'react';
import { apiPut } from '../util/api-helper';
import type { GearItem, Trip } from '../types';

/**
 * Hook to update trip gear list
 */
export function useUpdateGearList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateGearList = async (tripId: string, gearList: GearItem[]): Promise<Trip | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPut<Trip>(`/trips/${tripId}/gear`, { gearList });
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
    updateGearList,
  };
}
