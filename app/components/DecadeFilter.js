// ../components/DecadeFilter.js
'use client';

import React from 'react';

const DecadeFilter = ({ selectedDecade, uniqueDecades, onChange }) => {
  return (
    <div className="filter-container">
      <label htmlFor="decade-select">Decade:</label>
      <select
        id="decade-select"
        value={selectedDecade}
        onChange={onChange}
        className="genre-select"
      >
        {uniqueDecades.map((decade) => (
          <option key={decade} value={decade}>
            {decade === 'All' ? 'All' : `${decade}s`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DecadeFilter;