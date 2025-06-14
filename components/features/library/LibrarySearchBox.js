import { useState, useCallback, useMemo, useEffect } from 'react';
import Input from '../../ui/Input';

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
      <Input
        variant="search"
        placeholder="Search by artist or album..."
        value={searchTerm}
        onChange={e => handleSearch(e.target.value)}
      />
    </div>
  );
};

export default LibrarySearchBox;
