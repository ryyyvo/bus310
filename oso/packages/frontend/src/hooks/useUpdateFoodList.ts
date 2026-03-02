import { useState } from 'react';
import { apiPut } from '../util/api-helper';
import type { FoodItem, Trip } from '../types';

/**
 * Hook to update trip food list
 */
export function useUpdateFoodList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateFoodList = async (tripId: string, foodList: FoodItem[]): Promise<Trip | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPut<Trip>(`/trips/${tripId}/food`, { foodList });
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
    updateFoodList,
  };
}
