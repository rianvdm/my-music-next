// ../components/GenreFilter.js
'use client';

import React from 'react';

const GenreFilter = ({ selectedGenre, uniqueGenres, onChange }) => {
  return (
    <div>
      <label htmlFor="genre-select">Genre: </label>
      <select
        id="genre-select"
        value={selectedGenre}
        onChange={onChange}
        className="genre-select"
      >
        {uniqueGenres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenreFilter;