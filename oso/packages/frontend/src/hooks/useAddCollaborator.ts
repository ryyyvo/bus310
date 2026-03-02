import { useState } from 'react';
import { apiPost } from '../util/api-helper';
import type { Trip } from '../types';

/**
 * Hook to add a collaborator to a trip
 */
export function useAddCollaborator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addCollaborator = async (tripId: string, collaboratorId: string): Promise<Trip | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<Trip>(`/trips/${tripId}/collaborators`, { collaboratorId });
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
    addCollaborator,
  };
}
