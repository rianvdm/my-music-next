// ABOUTME: Dropdown filter component for selecting music formats from a collection
// ABOUTME: Renders a select input with format options and handles selection changes
'use client';

import React, { memo } from 'react';

const FormatFilter = memo(({ selectedFormat, uniqueFormats, onChange }) => {
  return (
    <div className="filter-container">
      <label htmlFor="format-select">Format:</label>
      <select
        id="format-select"
        value={selectedFormat}
        onChange={onChange}
        className="genre-select"
      >
        {uniqueFormats.map(format => (
          <option key={format} value={format}>
            {format}
          </option>
        ))}
      </select>
    </div>
  );
});

FormatFilter.displayName = 'FormatFilter';

export default FormatFilter;
