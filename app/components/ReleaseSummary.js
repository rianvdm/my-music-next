// ../components/ReleaseSummary.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';

const ReleaseSummary = ({
  releaseCount,
  selectedGenre,
  selectedFormat,
  selectedDecade,
  selectedStyle, // Optional prop
  className = '',
}) => {
  return (
    <p className={className}>
      My{' '}
      <a
        href="https://www.discogs.com/user/elezea-records/collection"
        target="_blank"
        rel="noopener noreferrer"
      >
        physical music collection
      </a>{' '}
      contains{' '}
      <strong className="highlight">{releaseCount} releases</strong>
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
      {selectedDecade !== 'All' && (
        <>
          {' '}
          from the <strong className="highlight">{selectedDecade}s</strong>
        </>
      )}
      {/* Conditionally render the Style information */}
      {selectedStyle && selectedStyle !== 'All' && (
        <>
          {' '}
          with the <strong className="highlight">{selectedStyle}</strong> style
        </>
      )}
      .
    </p>
  );
};

ReleaseSummary.propTypes = {
  releaseCount: PropTypes.number.isRequired,
  selectedGenre: PropTypes.string.isRequired,
  selectedFormat: PropTypes.string.isRequired,
  selectedDecade: PropTypes.string.isRequired,
  selectedStyle: PropTypes.string, // Optional
  className: PropTypes.string,
};

export default ReleaseSummary;