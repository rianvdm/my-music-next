// ../pages/collection/all.js
'use client';

export const runtime = 'edge';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateArtistSlug, generateAlbumSlug } from '../../utils/slugify';

// Importing Filter Components
import FilterDropdown from '../../../components/ui/FilterDropdown';
import Button from '../../../components/ui/Button';
import ReleaseSummary from '../../../components/features/collection/ReleaseSummary';
import SearchBox from '../../../components/features/search/SearchBox'; // Import SearchBox component
import LazyImage from '../../../components/ui/LazyImage'; // Import LazyImage component

const ITEMS_PER_PAGE = 25;

const CollectionListPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGenre = searchParams.get('genre') || 'All';
  const initialFormat = searchParams.get('format') || 'All';
  const initialDecade = searchParams.get('decade') || 'All';
  const initialStyle = searchParams.get('style') || 'All';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedFormat, setSelectedFormat] = useState(initialFormat);
  const [selectedDecade, setSelectedDecade] = useState(initialDecade);
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [uniqueFormats, setUniqueFormats] = useState([]);
  const [uniqueDecades, setUniqueDecades] = useState([]);

  // New state for random releases
  const [randomReleases, setRandomReleases] = useState([]);

  // New state for search results
  const [searchResults, setSearchResults] = useState(null);

  // Add sort control near other state declarations
  const [sortOption, setSortOption] = useState('dateAdded');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://kv-fetch-discogs-all.rian-db8.workers.dev');
        const data = await response.json();
        setCollectionData(data);

        // Set genres from stats
        const genres = ['All', ...data.stats.uniqueGenres.sort()];
        setUniqueGenres(genres);

        // Calculate top formats
        const formatCounts = data.data.releases.reduce((acc, release) => {
          const format = release.basic_information.formats[0]?.name;
          if (format) {
            acc[format] = (acc[format] || 0) + 1;
          }
          return acc;
        }, {});

        const sortedFormats = Object.entries(formatCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([format]) => format);

        setUniqueFormats(['All', ...sortedFormats, 'Other']);

        // Calculate decades
        const decades = [
          'All',
          ...Array.from(
            new Set(
              data.data.releases
                .map(
                  release =>
                    Math.floor((release.original_year || release.basic_information.year) / 10) * 10
                )
                .filter(decade => decade)
            )
          ).sort((a, b) => a - b),
        ];

        setUniqueDecades(decades);
        setLoading(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching Discogs collection:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAndSortedReleases = useMemo(() => {
    if (!collectionData) {
      return [];
    }

    return collectionData.data.releases
      .filter(release => {
        const releaseYear = release.original_year || release.basic_information.year;
        const releaseDecade = Math.floor(releaseYear / 10) * 10;
        const releaseFormat = release.basic_information.formats[0]?.name;

        const genres =
          release.master_genres && Array.isArray(release.master_genres)
            ? release.master_genres
            : release.basic_information.genres;

        const styles =
          release.master_styles && Array.isArray(release.master_styles)
            ? release.master_styles
            : release.basic_information.styles;

        const genreMatch =
          selectedGenre === 'All' ||
          (selectedGenre === 'Other'
            ? !uniqueGenres.slice(1, -1).some(genre => genres?.includes(genre))
            : genres?.includes(selectedGenre));

        const formatMatch =
          selectedFormat === 'All' ||
          (selectedFormat === 'Other'
            ? !uniqueFormats.slice(1, -1).includes(releaseFormat)
            : releaseFormat === selectedFormat);

        return (
          genreMatch &&
          formatMatch &&
          (selectedDecade === 'All' || releaseDecade === parseInt(selectedDecade, 10)) &&
          (selectedStyle === 'All' || styles?.includes(selectedStyle))
        );
      })
      .sort((a, b) => {
        if (sortOption === 'dateAdded') {
          const dateA = new Date(a.date_added || 0);
          const dateB = new Date(b.date_added || 0);
          return dateB - dateA;
        } else {
          // Sort by artist name, then by release year
          const artistCompare = a.basic_information.artists[0].name.localeCompare(
            b.basic_information.artists[0].name
          );
          if (artistCompare !== 0) {
            return artistCompare;
          }

          const yearA = a.original_year || a.basic_information.year || 0;
          const yearB = b.original_year || b.basic_information.year || 0;
          return yearA - yearB;
        }
      });
  }, [
    collectionData,
    selectedGenre,
    selectedFormat,
    selectedDecade,
    selectedStyle,
    uniqueGenres,
    uniqueFormats,
    sortOption,
  ]);

  const availableStyles = useMemo(() => {
    if (!collectionData) {
      return ['All'];
    }

    const stylesCount = new Map();

    collectionData.data.releases.forEach(release => {
      const releaseYear = release.original_year || release.basic_information.year;
      const releaseDecade = Math.floor(releaseYear / 10) * 10;
      const releaseFormat = release.basic_information.formats[0]?.name;

      const genres =
        release.master_genres && Array.isArray(release.master_genres)
          ? release.master_genres
          : release.basic_information.genres;

      const styles =
        release.master_styles && Array.isArray(release.master_styles)
          ? release.master_styles
          : release.basic_information.styles;

      const matchesGenre = selectedGenre === 'All' || genres?.includes(selectedGenre);
      const matchesFormat = selectedFormat === 'All' || releaseFormat === selectedFormat;
      const matchesDecade =
        selectedDecade === 'All' || releaseDecade === parseInt(selectedDecade, 10);

      if (matchesGenre && matchesFormat && matchesDecade) {
        styles?.forEach(style => {
          stylesCount.set(style, (stylesCount.get(style) || 0) + 1);
        });
      }
    });

    return [
      'All',
      ...Array.from(stylesCount.entries())
        .filter(([, count]) => count > 0)
        .map(([style]) => style)
        .sort((a, b) => a.localeCompare(b)),
    ];
  }, [collectionData, selectedGenre, selectedFormat, selectedDecade]);

  const totalPages = Math.ceil(filteredAndSortedReleases.length / ITEMS_PER_PAGE);

  // Modify the handleSearchResults function
  const handleSearchResults = useCallback(results => {
    setSearchResults(results);
    setCurrentPage(1); // Reset to first page when search results change
  }, []);

  // Modify the currentReleases calculation
  const currentReleases = useMemo(() => {
    let releasesToDisplay = searchResults !== null ? searchResults : filteredAndSortedReleases;
    if (randomReleases.length > 0) {
      releasesToDisplay = randomReleases;
    }
    return releasesToDisplay.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredAndSortedReleases, currentPage, randomReleases, searchResults]);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (selectedGenre !== 'All') {
      queryParams.set('genre', selectedGenre);
    }
    if (selectedFormat !== 'All') {
      queryParams.set('format', selectedFormat);
    }
    if (selectedDecade !== 'All') {
      queryParams.set('decade', selectedDecade);
    }
    if (selectedStyle !== 'All') {
      queryParams.set('style', selectedStyle);
    }
    if (currentPage !== 1) {
      queryParams.set('page', currentPage.toString());
    }

    const queryString = queryParams.toString();
    const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');

    router.replace(newUrl);
  }, [selectedGenre, selectedFormat, selectedDecade, selectedStyle, currentPage, router]);

  // Handler for Genre filter change
  const handleGenreChange = e => {
    setSelectedGenre(e.target.value);
    setSelectedStyle('All'); // Reset Style filter when Genre changes
    setCurrentPage(1);
    setRandomReleases([]); // Clear random releases when filters change
    setSearchResults(null); // Clear search results when filters change
  };

  // Handler for Format filter change
  const handleFormatChange = e => {
    setSelectedFormat(e.target.value);
    setCurrentPage(1);
    setRandomReleases([]); // Clear random releases when filters change
    setSearchResults(null); // Clear search results when filters change
  };

  // Handler for Decade filter change
  const handleDecadeChange = e => {
    setSelectedDecade(e.target.value);
    setCurrentPage(1);
    setRandomReleases([]); // Clear random releases when filters change
    setSearchResults(null); // Clear search results when filters change
  };

  // Handler for Style filter change
  const handleStyleChange = e => {
    setSelectedStyle(e.target.value);
    setCurrentPage(1);
    setRandomReleases([]); // Clear random releases when filters change
    setSearchResults(null); // Clear search results when filters change
  };

  // Handler for page change
  const handlePageChange = newPage => {
    setCurrentPage(newPage);
    setRandomReleases([]); // Clear random releases when page changes
  };

  // Handler to reset all filters
  const resetFilters = () => {
    setSelectedGenre('All');
    setSelectedFormat('All');
    setSelectedDecade('All');
    setSelectedStyle('All');
    setCurrentPage(1);
    setRandomReleases([]); // Clear random releases when resetting filters
    setSearchResults(null); // Clear search results when resetting filters
  };

  // Handler for Random Release click
  const handleRandomReleaseClick = e => {
    e.preventDefault();
    if (filteredAndSortedReleases.length === 0) {
      return;
    }
    const randomCount = Math.min(3, filteredAndSortedReleases.length);
    const shuffled = [...filteredAndSortedReleases].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, randomCount);
    setRandomReleases(selected);
    setCurrentPage(1); // Optionally reset to first page
    setSearchResults(null); // Clear search results when random selection is made
  };

  // Handler to clear Random Releases
  const handleClearRandomReleases = e => {
    e.preventDefault();
    setRandomReleases([]);
  };

  // Add a new function to handle link clicks
  const handleLinkClick = (e, href) => {
    e.preventDefault();
    router.push(href);
  };

  if (loading) {
    return <div className="track_ul2">Loading collection data...</div>;
  }

  return (
    <div>
      <h1>My Music Collection</h1>
      <div className="track_ul2">
        {/* Use the ReleaseSummary component with additional styling and selectedStyle */}
        <ReleaseSummary
          releaseCount={
            randomReleases.length > 0
              ? randomReleases.length
              : searchResults
                ? searchResults.length
                : filteredAndSortedReleases.length
          }
          selectedGenre={selectedGenre}
          selectedFormat={selectedFormat}
          selectedDecade={selectedDecade}
          selectedStyle={selectedStyle !== 'All' ? selectedStyle : null} // Pass selectedStyle only if it's not 'All'
          className="custom-summary-class" // Add custom class for additional styling
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          {/* Container for Filter Components */}
          <div
            style={{
              display: 'flex',
              columnGap: '1.5rem', // Horizontal gap
              rowGap: '0', // Smaller vertical gap
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <FilterDropdown
              label="Genre"
              id="genre-select"
              value={selectedGenre}
              options={uniqueGenres}
              onChange={handleGenreChange}
            />
            <FilterDropdown
              label="Style"
              id="style-select"
              value={selectedStyle}
              options={availableStyles}
              onChange={handleStyleChange}
              style={{ minWidth: '200px' }}
            />
            <FilterDropdown
              label="Format"
              id="format-select"
              value={selectedFormat}
              options={uniqueFormats}
              onChange={handleFormatChange}
            />
            <FilterDropdown
              label="Decade"
              id="decade-select"
              value={selectedDecade}
              options={uniqueDecades}
              onChange={handleDecadeChange}
              formatOption={decade => (decade === 'All' ? 'All' : `${decade}s`)}
            />

            <FilterDropdown
              label="Sort by"
              id="sort"
              value={sortOption}
              options={['dateAdded', 'artistName']}
              onChange={e => setSortOption(e.target.value)}
              formatOption={option => (option === 'dateAdded' ? 'Date Added' : 'Artist Name')}
            />
          </div>

          {/* Add SearchBox component */}
          <SearchBox data={filteredAndSortedReleases} onSearchResults={handleSearchResults} />

          {/* Container for Action Buttons */}
          <div
            style={{
              marginTop: '0',
              marginBottom: '1rem',
            }}
          >
            <Button variant="link" onClick={resetFilters} style={{ marginRight: '2rem' }}>
              Reset filters
            </Button>
            <Button
              variant="link"
              onClick={handleRandomReleaseClick}
              style={{ marginRight: '2rem' }}
            >
              Random selection
            </Button>
            {randomReleases.length > 0 && (
              <Button variant="link" onClick={handleClearRandomReleases}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="track_ul">
        {currentReleases.map(release => {
          const artistSlug = generateArtistSlug(release.basic_information.artists[0].name);
          const albumSlug = generateAlbumSlug(release.basic_information.title);

          // Format the date
          const addedDate = release.date_added
            ? new Date(release.date_added).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Unknown date';

          return (
            <div key={release.id} className="track_item track_item_responsive">
              <a
                href={`https://www.discogs.com/release/${release.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {release.basic_information.cover_image ? (
                  <LazyImage
                    src={release.basic_information.cover_image}
                    alt={release.basic_information.title}
                    width={200}
                    height={200}
                  />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
              </a>
              <div className="no-wrap-text">
                <p>
                  <a
                    href={`/artist/${artistSlug}`}
                    onClick={e => handleLinkClick(e, `/artist/${artistSlug}`)}
                  >
                    <strong>{release.basic_information.artists[0].name}</strong>
                  </a>
                  {' - '}
                  <a
                    href={`/album/${artistSlug}_${albumSlug}`}
                    onClick={e => handleLinkClick(e, `/album/${artistSlug}_${albumSlug}`)}
                  >
                    {release.basic_information.title}
                  </a>
                </p>
                <p>
                  <strong>Format:</strong> {release.basic_information.formats[0]?.name || 'Unknown'}
                  <br />
                  <strong>Released:</strong>{' '}
                  {release.original_year || release.basic_information.year}
                  <br />
                  <strong>Genres:</strong>{' '}
                  {(release.master_genres || release.basic_information.genres).join(', ')}
                  <br />
                  <strong>Styles:</strong>{' '}
                  {(release.master_styles || release.basic_information.styles).join(', ')}
                  <br />
                  <strong>Added:</strong> {addedDate}
                </p>
              </div>
            </div>
          );
        })}
        {/* Display a message if no releases are found */}
        {currentReleases.length === 0 && (
          <div className="track_ul2">No releases found for the selected filters.</div>
        )}
      </div>
      {/* Show pagination only if randomReleases is not active */}
      {randomReleases.length === 0 && (
        <div
          className="track_ul2"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CollectionListPage;
