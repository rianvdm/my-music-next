// ../../components/SearchBox.js
import { useState, useEffect } from 'react';

const SearchBox = ({ data, onSearchResults }) => {
  const [query, setQuery] = useState('');

  // This function filters the data as soon as the user types 2 or more characters
  useEffect(() => {
    if (query.length >= 2) {
      const lowercasedQuery = query.toLowerCase();
      const queryWords = lowercasedQuery.split(' ').filter(Boolean); // Split query into words and remove empty strings

      const filteredData = data.filter((release) => {
        const artistName = release.basic_information.artists[0].name.toLowerCase();
        const albumTitle = release.basic_information.title.toLowerCase();

        // Check if every word in queryWords is included in either artistName or albumTitle
        return queryWords.every((word) =>
          artistName.includes(word) || albumTitle.includes(word)
        );
      });

      onSearchResults(filteredData);
    } else {
      onSearchResults(data); // Reset to all data if query is less than 2 characters
    }
  }, [query, data, onSearchResults]);

  // Function to clear the search input
  const handleClearSearch = () => {
    setQuery('');
    onSearchResults(data); // Reset the data when the search is cleared
  };

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
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by artist or album title"
        className="search-input" // Apply your existing styles here
      />
      {/* Clear search link */}
      {query && (
        <a
          href="#"
          onClick={(e) => {
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
};

export default SearchBox;