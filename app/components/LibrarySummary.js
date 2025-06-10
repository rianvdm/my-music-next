'use client';

import React from 'react';
import PropTypes from 'prop-types';

const LibrarySummary = ({
  releaseCount,
  selectedGenre,
  selectedFormat,
  selectedYear,
  className = '',
}) => {
  return (
    <p className={className}>
      My digital library contains{' '}
      <strong className="highlight">
        {releaseCount} release{releaseCount !== 1 ? 's' : ''}
      </strong>
      {selectedGenre !== 'All' && (
        <>
          {' '}
          in the <strong className="highlight">{selectedGenre}</strong>{' '}
          {selectedGenre === 'Other' ? 'genres' : 'genre'}
        </>
      )}
      {selectedFormat !== 'All' && (
        <>
          {' '}
          on <strong className="highlight">{selectedFormat}</strong>{' '}
          {selectedFormat === 'Other' ? 'formats' : 'format'}
        </>
      )}
      {selectedYear !== 'All' && (
        <>
          {' '}
          from the <strong className="highlight">{selectedYear}s</strong>
        </>
      )}
      .
    </p>
  );
};

LibrarySummary.propTypes = {
  releaseCount: PropTypes.number.isRequired,
  selectedGenre: PropTypes.string.isRequired,
  selectedFormat: PropTypes.string.isRequired,
  selectedYear: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default LibrarySummary;
