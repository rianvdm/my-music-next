import { useState, useCallback } from 'react';

const LibrarySearchBox = ({ data, onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      onSearchResults(null);
      return;
    }

    const searchLower = term.toLowerCase();
    const filteredData = data.filter((release) => {
      const artistName = (release['Album Artist'] || '').toLowerCase();
      const albumTitle = (release['Title'] || '').toLowerCase();
      
      return artistName.includes(searchLower) || albumTitle.includes(searchLower);
    });

    onSearchResults(filteredData);
  }, [data, onSearchResults]);

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search by artist or album..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default LibrarySearchBox; 