// ../components/StyleFilter.js
'use client';

import React from 'react';

const StyleFilter = ({ selectedStyle, availableStyles, onChange }) => {
  return (
    <div className="filter-container">
      <label htmlFor="style-select">Style:</label>
      <select
        id="style-select"
        value={selectedStyle}
        onChange={onChange}
        className="genre-select"
        style={{ minWidth: '200px' }}
      >
        {availableStyles.map((style) => (
          <option key={style} value={style}>
            {style}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StyleFilter;