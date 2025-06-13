'use client';

import { useEffect, useState } from 'react';
import { genres } from '../utils/genres';

/**
 * Custom hook to select and format a random genre
 * @returns {Object} Object with urlGenre (slug format) and displayGenre (formatted for display)
 */
export function useRandomGenre() {
  const [genreData, setGenreData] = useState({ urlGenre: null, displayGenre: null });

  useEffect(() => {
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];

    // Capitalize the first letter of each word and replace hyphens with spaces
    const displayGenre = randomGenre
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    setGenreData({ urlGenre: randomGenre, displayGenre });
  }, []);

  return genreData;
}
