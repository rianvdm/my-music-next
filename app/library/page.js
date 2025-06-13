'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LazyImage from '../../components/ui/LazyImage';
import LibrarySearchBox from '../../components/features/library/LibrarySearchBox';
import LibrarySummary from '../../components/features/library/LibrarySummary';
import { generateArtistSlug, generateAlbumSlug } from '../utils/slugify';

const ITEMS_PER_PAGE = 25;

const LibraryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGenre = searchParams.get('genre') || 'All';
  const initialFormat = searchParams.get('format') || 'All';
  const initialYear = searchParams.get('year') || 'All';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  // State management
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedFormat, setSelectedFormat] = useState(initialFormat);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [libraryData, setLibraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [sortOption, setSortOption] = useState('dateAdded');
  const [uniqueGenres, setUniqueGenres] = useState(['All']);
  const [uniqueFormats, setUniqueFormats] = useState(['All']);
  const [uniqueYears, setUniqueYears] = useState(['All']);
  const [randomReleases, setRandomReleases] = useState([]);

  // Fetch library data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api-library.rian-db8.workers.dev/api/library');
        const data = await response.json();
        setLibraryData(data.records);

        // Extract and count genres
        const genreCounts = new Map();
        genreCounts.set('All', Infinity); // Ensure 'All' stays at the top

        data.records.forEach(record => {
          if (record.Genres) {
            record.Genres.split(', ').forEach(genre => {
              genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
            });
          }
        });

        // Convert to array, sort by count, and extract just the genre names
        const sortedGenres = Array.from(genreCounts.entries())
          .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
          .map(([genre]) => genre); // Extract just the genre names

        setUniqueGenres(sortedGenres);

        // Extract unique formats
        const formats = new Set(['All']);
        data.records.forEach(record => {
          if (record['File Format']) {
            formats.add(record['File Format']);
          }
        });
        setUniqueFormats(Array.from(formats));

        // Extract unique decades instead of years
        const decades = new Set(['All']);
        data.records.forEach(record => {
          if (record.Date) {
            const year = record.Date.substring(0, 4);
            const decade = Math.floor(year / 10) * 10;
            if (!isNaN(decade)) {
              decades.add(decade);
            }
          }
        });
        setUniqueYears(Array.from(decades).sort());

        setLoading(false);
      } catch (error) {
        console.error('Error fetching library data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort releases
  const filteredAndSortedReleases = useMemo(() => {
    if (!libraryData) {
      return [];
    }

    return libraryData
      .filter(release => {
        const genres = release.Genres ? release.Genres.split(', ') : [];
        const year = release.Date ? release.Date.substring(0, 4) : '';
        const decade = Math.floor(parseInt(year) / 10) * 10;
        const format = release['File Format'];

        const genreMatch = selectedGenre === 'All' || genres.includes(selectedGenre);
        const formatMatch = selectedFormat === 'All' || format === selectedFormat;
        const yearMatch = selectedYear === 'All' || decade === parseInt(selectedYear);

        return genreMatch && formatMatch && yearMatch;
      })
      .sort((a, b) => {
        if (sortOption === 'dateAdded') {
          const dateA = a.Date || '';
          const dateB = b.Date || '';
          return dateB.localeCompare(dateA);
        } else {
          const artistA = a['Album Artist'] || '';
          const artistB = b['Album Artist'] || '';
          return artistA.localeCompare(artistB);
        }
      });
  }, [libraryData, selectedGenre, selectedFormat, selectedYear, sortOption]);

  // Handle search results
  const handleSearchResults = useCallback(results => {
    setSearchResults(results);
    setCurrentPage(1);
  }, []);

  // Calculate current page items
  const currentReleases = useMemo(() => {
    let releasesToDisplay = searchResults !== null ? searchResults : filteredAndSortedReleases;
    if (randomReleases.length > 0) {
      releasesToDisplay = randomReleases;
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return releasesToDisplay.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedReleases, currentPage, searchResults, randomReleases]);

  // Update URL with filters
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (selectedGenre !== 'All') {
      queryParams.set('genre', selectedGenre);
    }
    if (selectedFormat !== 'All') {
      queryParams.set('format', selectedFormat);
    }
    if (selectedYear !== 'All') {
      queryParams.set('year', selectedYear);
    }
    if (currentPage !== 1) {
      queryParams.set('page', currentPage.toString());
    }

    const queryString = queryParams.toString();
    const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');
    router.replace(newUrl);
  }, [selectedGenre, selectedFormat, selectedYear, currentPage, router]);

  // Reset filters
  const resetFilters = () => {
    setSelectedGenre('All');
    setSelectedFormat('All');
    setSelectedYear('All');
    setCurrentPage(1);
    setSearchResults(null);
  };

  const handleRandomReleaseClick = e => {
    e.preventDefault();
    if (!filteredAndSortedReleases.length) {
      return;
    }
    const randomCount = Math.min(3, filteredAndSortedReleases.length);
    const shuffled = [...filteredAndSortedReleases].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, randomCount);
    setRandomReleases(selected);
    setCurrentPage(1);
    setSearchResults(null);
  };

  const handleClearRandomReleases = e => {
    e.preventDefault();
    setRandomReleases([]);
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    router.push(href);
  };

  if (loading) {
    return <div className="track_ul2">Loading library data...</div>;
  }

  return (
    <div>
      <h1>Digital Library</h1>
      <div className="track_ul2">
        <LibrarySummary
          releaseCount={searchResults ? searchResults.length : filteredAndSortedReleases.length}
          selectedGenre={selectedGenre}
          selectedFormat={selectedFormat}
          selectedYear={selectedYear}
        />

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}
        >
          {/* Filters */}
          <div
            style={{
              display: 'flex',
              columnGap: '1.5rem',
              rowGap: '0',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {/* Genre Filter */}
            <div className="filter-container">
              <label htmlFor="genre">Genre:</label>
              <select
                id="genre"
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
                className="genre-select"
              >
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Filter */}
            <div className="filter-container">
              <label htmlFor="format">Format:</label>
              <select
                id="format"
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value)}
                className="genre-select"
              >
                {uniqueFormats.map(format => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="filter-container">
              <label htmlFor="year">Decade:</label>
              <select
                id="year"
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="genre-select"
              >
                {uniqueYears.map(decade => (
                  <option key={decade} value={decade}>
                    {decade === 'All' ? 'All' : `${decade}s`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Option */}
            <div className="filter-container">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="genre-select"
              >
                <option value="dateAdded">Release Date</option>
                <option value="artistName">Artist Name</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <LibrarySearchBox
            data={filteredAndSortedReleases}
            onSearchResults={handleSearchResults}
          />

          {/* Reset Filters Link */}
          <div style={{ marginTop: '0', marginBottom: '1rem' }}>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                resetFilters();
              }}
              style={{ marginRight: '2rem' }}
            >
              Reset filters
            </a>
            <a href="#" onClick={handleRandomReleaseClick} style={{ marginRight: '2rem' }}>
              Random selection
            </a>
            {randomReleases.length > 0 && (
              <a href="#" onClick={handleClearRandomReleases}>
                Clear
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Display Releases */}
      <div className="track_ul">
        {currentReleases.map(release => {
          const artistSlug = generateArtistSlug(release['Album Artist']);
          const albumSlug = generateAlbumSlug(release.Title);

          return (
            <div key={release.id} className="track_item track_item_responsive">
              <div className="artwork-container">
                <LazyImage
                  src={release['Cover Image URL'] || 'https://file.elezea.com/noun-no-image.png'}
                  alt={release.Title}
                  width={200}
                  height={200}
                />
              </div>

              <div className="release-info">
                <div className="no-wrap-text">
                  <p>
                    <a
                      href={`/artist/${artistSlug}`}
                      onClick={e => handleLinkClick(e, `/artist/${artistSlug}`)}
                    >
                      <strong>{release['Album Artist']}</strong>
                    </a>
                    {' - '}
                    <a
                      href={`/album/${artistSlug}_${albumSlug}`}
                      onClick={e => handleLinkClick(e, `/album/${artistSlug}_${albumSlug}`)}
                    >
                      {release.Title}
                    </a>
                    {release.Version && release.Version !== 'dl' && ` (${release.Version})`}
                  </p>
                  <p>
                    <strong>Format:</strong> {release['File Format']}
                    <br />
                    {release.Date && (
                      <>
                        <strong>Released:</strong> {release.Date.substring(0, 4)}
                        <br />
                      </>
                    )}
                    {release.Genres && (
                      <>
                        <strong>Genres:</strong> {release.Genres}
                        <br />
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {currentReleases.length === 0 && (
          <div className="track_ul2">No releases found for the selected filters.</div>
        )}
      </div>

      {/* Pagination */}
      <div
        className="track_ul2"
        style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}
      >
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="button"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {Math.ceil(filteredAndSortedReleases.length / ITEMS_PER_PAGE)}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredAndSortedReleases.length / ITEMS_PER_PAGE)}
          className="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LibraryPage;
