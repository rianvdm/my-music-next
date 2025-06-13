// ../components/StyleFilter.js
'use client';

import React, { memo } from 'react';

const StyleFilter = memo(({ selectedStyle, availableStyles, onChange }) => {
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
        {availableStyles.map(style => (
          <option key={style} value={style}>
            {style}
          </option>
        ))}
      </select>
    </div>
  );
});

StyleFilter.displayName = 'StyleFilter';

export default StyleFilter;
