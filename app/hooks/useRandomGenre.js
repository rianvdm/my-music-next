// ABOUTME: Custom React hook that selects a random music genre and formats it for both URL slugs and display purposes
// ABOUTME: Uses memoization to prevent unnecessary re-renders and provides consistent genre data across component lifecycle
'use client';

import { useEffect, useState, useMemo } from 'react';
import { genres } from '../utils/genres';

/**
 * Custom hook to select and format a random genre
 * @returns {Object} Object with urlGenre (slug format) and displayGenre (formatted for display)
 */
export function useRandomGenre() {
  const [genreData, setGenreData] = useState({ urlGenre: null, displayGenre: null });

  const randomGenre = useMemo(() => {
    return genres[Math.floor(Math.random() * genres.length)];
  }, []);

  const displayGenre = useMemo(() => {
    return randomGenre
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [randomGenre]);

  useEffect(() => {
    setGenreData({ urlGenre: randomGenre, displayGenre });
  }, [randomGenre, displayGenre]);

  return genreData;
}
