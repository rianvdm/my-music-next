// ../components/GenreFilter.js
'use client';

import React, { memo } from 'react';

const GenreFilter = memo(({ selectedGenre, uniqueGenres, onChange }) => {
  return (
    <div className="filter-container">
      <label htmlFor="genre-select">Genre:</label>
      <select id="genre-select" value={selectedGenre} onChange={onChange} className="genre-select">
        {uniqueGenres.map(genre => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
    </div>
  );
});

GenreFilter.displayName = 'GenreFilter';

export default GenreFilter;
