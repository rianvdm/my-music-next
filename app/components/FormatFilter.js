// ../components/FormatFilter.js
'use client';

import React from 'react';

const FormatFilter = ({ selectedFormat, uniqueFormats, onChange }) => {
  return (
    <div className="filter-container">
      <label htmlFor="format-select">Format:</label>
      <select
        id="format-select"
        value={selectedFormat}
        onChange={onChange}
        className="genre-select"
      >
        {uniqueFormats.map((format) => (
          <option key={format} value={format}>
            {format}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormatFilter;