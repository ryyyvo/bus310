import { useState } from 'react';
import { apiGet } from '../util/api-helper';
import type { SearchParksResponse } from '../types';

/**
 * Hook to search for parks
 */
export function useSearchParks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchParks = async (
    state?: string,
    query?: string,
    limit?: number
  ): Promise<SearchParksResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (state) params.state = state;
      if (query) params.query = query;
      if (limit) params.limit = limit;

      const data = await apiGet<SearchParksResponse>('/campsites/parks', params);
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
    searchParks,
  };
}
