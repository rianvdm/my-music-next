// ../../components/SearchBox.js
import { useState, useEffect, memo, useCallback, useMemo } from 'react';

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
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Filter by artist or album title"
        className="search-input" // Apply your existing styles here
      />
      {/* Clear search link */}
      {query && (
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            handleClearSearch();
          }}
          className="clear-search-link" // Apply custom link styles
        >
          Clear search
        </a>
      )}
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

export default SearchBox;
