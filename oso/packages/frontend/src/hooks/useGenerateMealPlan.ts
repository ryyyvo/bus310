import { useState } from 'react';
import { apiPost } from '../util/api-helper';
import type { GenerateMealPlanRequest, GenerateMealPlanResponse } from '../types';

/**
 * Hook to generate AI meal plan recommendations
 */
export function useGenerateMealPlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateMealPlan = async (data: GenerateMealPlanRequest): Promise<GenerateMealPlanResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost<GenerateMealPlanResponse>('/trips/generate/meal-plan', data);
      return response;
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
    generateMealPlan,
  };
}
