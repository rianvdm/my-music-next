// ABOUTME: Advanced search component with multi-word query support and clear functionality
// ABOUTME: Filters collection data by artist or album title with optimized performance using memoization
import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const SearchBox = memo(({ data, onSearchResults }) => {
  const [query, setQuery] = useState('');

  // Memoize the filtered data calculation
  const filteredData = useMemo(() => {
    if (query.length >= 2) {
      const lowercasedQuery = query.toLowerCase();
      const queryWords = lowercasedQuery.split(' ').filter(Boolean);

      return data.filter(release => {
        const artistName = release.basic_information.artists[0].name.toLowerCase();
        const albumTitle = release.basic_information.title.toLowerCase();

        return queryWords.every(word => artistName.includes(word) || albumTitle.includes(word));
      });
    }
    return data;
  }, [query, data]);

  // Effect to call onSearchResults when filtered data changes
  useEffect(() => {
    onSearchResults(filteredData);
  }, [filteredData, onSearchResults]);

  // Function to clear the search input
  const handleClearSearch = useCallback(() => {
    setQuery('');
    onSearchResults(data); // Reset the data when the search is cleared
  }, [data, onSearchResults]);

  return (
    <div
      style={{
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <Input
        variant="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Filter by artist or album title"
      />
      {/* Clear search button */}
      {query && (
        <Button variant="link" onClick={handleClearSearch} size="small">
          Clear search
        </Button>
      )}
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

export default SearchBox;
