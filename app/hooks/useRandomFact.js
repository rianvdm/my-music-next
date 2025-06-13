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
        console.error('Error fetching random fact:', error);
        setFact('Did you know? There was an error loading a random fact.');
      }
    };

    fetchRandomFact();
  }, []);

  return fact;
}
