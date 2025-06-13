import { useState, useCallback, useMemo, useEffect } from 'react';

const LibrarySearchBox = ({ data, onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return null;
    }

    const searchLower = searchTerm.toLowerCase();
    return data.filter(release => {
      const artistName = (release['Album Artist'] || '').toLowerCase();
      const albumTitle = (release['Title'] || '').toLowerCase();

      return artistName.includes(searchLower) || albumTitle.includes(searchLower);
    });
  }, [searchTerm, data]);

  useEffect(() => {
    onSearchResults(filteredData);
  }, [filteredData, onSearchResults]);

  const handleSearch = useCallback(term => {
    setSearchTerm(term);
  }, []);

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search by artist or album..."
        value={searchTerm}
        onChange={e => handleSearch(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default LibrarySearchBox;
