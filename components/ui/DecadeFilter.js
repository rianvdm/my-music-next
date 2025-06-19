// ABOUTME: Dropdown filter component for selecting music decades from a collection
// ABOUTME: Renders a select input with decade options and handles selection changes
'use client';

import React, { memo } from 'react';

const DecadeFilter = memo(({ selectedDecade, uniqueDecades, onChange }) => {
  return (
    <div className="filter-container">
      <label htmlFor="decade-select">Decade:</label>
      <select
        id="decade-select"
        value={selectedDecade}
        onChange={onChange}
        className="genre-select"
      >
        {uniqueDecades.map(decade => (
          <option key={decade} value={decade}>
            {decade === 'All' ? 'All' : `${decade}s`}
          </option>
        ))}
      </select>
    </div>
  );
});

DecadeFilter.displayName = 'DecadeFilter';

export default DecadeFilter;
