'use client';

import { memo } from 'react';

const FilterDropdown = memo(({ label, id, value, options, onChange, formatOption, style = {} }) => {
  return (
    <div className="filter-container">
      <label htmlFor={id}>{label}:</label>
      <select id={id} value={value} onChange={onChange} className="genre-select" style={style}>
        {options.map(option => (
          <option key={option} value={option}>
            {formatOption ? formatOption(option) : option}
          </option>
        ))}
      </select>
    </div>
  );
});

FilterDropdown.displayName = 'FilterDropdown';

export default FilterDropdown;
