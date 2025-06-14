'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to fetch and manage recent searches
 * @returns {Object} Object with searches array and loading state
 */
export function useRecentSearches() {
  const [searches, setSearches] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const response = await fetch('https://kv-fetch-recentsearches.rian-db8.workers.dev/');
        const data = await response.json();
        setSearches(data.data);
      } catch (error) {
        console.error('Error fetching recent searches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSearches();
  }, []);

  return { searches, isLoading };
}
