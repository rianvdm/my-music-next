// ABOUTME: Custom React hook that fetches and manages random music facts from an external API service
// ABOUTME: Provides automatic fact loading on mount with error handling and fallback messaging for failed requests
'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to fetch and manage a random music fact
 * @returns {string} The random fact text
 */
export function useRandomFact() {
  const [fact, setFact] = useState('Did you know');

  useEffect(() => {
    const fetchRandomFact = async () => {
      try {
        const response = await fetch('https://kv-fetch-random-fact.rian-db8.workers.dev/');
        const factData = await response.json();
        setFact(factData.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching random fact:', error);
        setFact('Did you know? There was an error loading a random fact.');
      }
    };

    fetchRandomFact();
  }, []);

  return fact;
}
