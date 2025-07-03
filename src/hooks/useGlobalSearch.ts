// src/hooks/useGlobalSearch.ts
import { useState, useCallback } from 'react';
import { SearchResultItem } from '@/types';
import * as api from '@/api/mockService';

export interface UseGlobalSearchReturn {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: SearchResultItem[];
  isLoading: boolean;
  error: Error | null;
  triggerSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useGlobalSearch = (): UseGlobalSearchReturn => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const triggerSearch = useCallback(async (query: string) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results = await api.searchGlobal(query);
      setSearchResults(results);
    } catch (err: any) {
      setError(err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    triggerSearch,
    clearSearch,
  };
};
