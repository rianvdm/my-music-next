'use client';

export const runtime = 'edge';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { generateArtistSlug, generateAlbumSlug } from '../../utils/slugify';

// Importing Filter Components
import GenreFilter from '../../components/GenreFilter';
import StyleFilter from '../../components/StyleFilter';
import FormatFilter from '../../components/FormatFilter';
import DecadeFilter from '../../components/DecadeFilter';

const ITEMS_PER_PAGE = 50;

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://kv-fetch-discogs-all.rian-db8.workers.dev'
        );
        const data = await response.json();
        setCollectionData(data);

        const genres = ['All', ...data.stats.uniqueGenres.sort()];
        const formats = [
          'All',
          ...new Set(
            data.data.releases
              .map((release) => release.basic_information.formats[0]?.name)
              .filter(Boolean)
          ),
        ].sort();
        const decades = [
          'All',
          ...Array.from(
            new Set(
              data.data.releases
                .map((release) =>
                  Math.floor(
                    (release.original_year || release.basic_information.year) / 10
                  ) * 10
                )
                .filter((decade) => decade)
            )
          ).sort((a, b) => a - b),
        ];

        setUniqueGenres(genres);
        setUniqueFormats(formats);
        setUniqueDecades(decades);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching Discogs collection:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAndSortedReleases = useMemo(() => {
    if (!collectionData) return [];

    return collectionData.data.releases
      .filter((release) => {
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

        return (
          (selectedGenre === 'All' || genres?.includes(selectedGenre)) &&
          (selectedFormat === 'All' || releaseFormat === selectedFormat) &&
          (selectedDecade === 'All' ||
            releaseDecade === parseInt(selectedDecade, 10)) &&
          (selectedStyle === 'All' || styles?.includes(selectedStyle))
        );
      })
      .sort((a, b) => {
        const artistA = a.basic_information.artists[0].name.toLowerCase();
        const artistB = b.basic_information.artists[0].name.toLowerCase();
        if (artistA < artistB) return -1;
        if (artistA > artistB) return 1;

        const yearA = a.original_year || a.basic_information.year;
        const yearB = b.original_year || b.basic_information.year;
        return yearA - yearB;
      });
  }, [collectionData, selectedGenre, selectedFormat, selectedDecade, selectedStyle]);

  const availableStyles = useMemo(() => {
    if (!collectionData) return ['All'];

    const stylesCount = new Map();

    collectionData.data.releases.forEach((release) => {
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
        styles?.forEach((style) => {
          stylesCount.set(style, (stylesCount.get(style) || 0) + 1);
        });
      }
    });

    return [
      'All',
      ...Array.from(stylesCount.entries())
        .filter(([style, count]) => count > 0)
        .map(([style]) => style)
        .sort((a, b) => a.localeCompare(b)),
    ];
  }, [collectionData, selectedGenre, selectedFormat, selectedDecade]);

  const totalPages = Math.ceil(filteredAndSortedReleases.length / ITEMS_PER_PAGE);

  const currentReleases = filteredAndSortedReleases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (selectedGenre !== 'All') queryParams.set('genre', selectedGenre);
    if (selectedFormat !== 'All') queryParams.set('format', selectedFormat);
    if (selectedDecade !== 'All') queryParams.set('decade', selectedDecade);
    if (selectedStyle !== 'All') queryParams.set('style', selectedStyle);
    if (currentPage !== 1) queryParams.set('page', currentPage.toString());

    const queryString = queryParams.toString();
    const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');

    router.replace(newUrl);
  }, [selectedGenre, selectedFormat, selectedDecade, selectedStyle, currentPage, router]);

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setSelectedStyle('All');
    setCurrentPage(1);
  };

  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
    setCurrentPage(1);
  };

  const handleDecadeChange = (e) => {
    setSelectedDecade(e.target.value);
    setCurrentPage(1);
  };

  const handleStyleChange = (e) => {
    setSelectedStyle(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const resetFilters = () => {
    setSelectedGenre('All');
    setSelectedFormat('All');
    setSelectedDecade('All');
    setSelectedStyle('All');
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="track_ul2">Loading collection data...</div>;
  }

  return (
    <div>
      <h1>My Music Collection</h1>
      <div className="track_ul2">
        <p>
          My physical music collection contains{' '}
          <strong className="highlight">
            {filteredAndSortedReleases.length} releases
          </strong>
          {selectedGenre !== 'All' && (
            <>
              {' '}
              in the <strong className="highlight">{selectedGenre}</strong>{' '}
              {selectedGenre === 'Other' ? 'genres' : 'genre'}
            </>
          )}
          {selectedStyle !== 'All' && (
            <>
              {' '}
              with the <strong className="highlight">{selectedStyle}</strong> style
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
          .
        </p>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Using the Filter Components */}
          <GenreFilter
            selectedGenre={selectedGenre}
            uniqueGenres={uniqueGenres}
            onChange={handleGenreChange}
          />
          <StyleFilter
            selectedStyle={selectedStyle}
            availableStyles={availableStyles}
            onChange={handleStyleChange}
          />
          <FormatFilter
            selectedFormat={selectedFormat}
            uniqueFormats={uniqueFormats}
            onChange={handleFormatChange}
          />
          <DecadeFilter
            selectedDecade={selectedDecade}
            uniqueDecades={uniqueDecades}
            onChange={handleDecadeChange}
          />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              resetFilters();
            }}
            style={{ marginLeft: '1rem' }}
          >
            Reset filters
          </a>
        </div>
      </div>
      <div className="track_ul">
        {currentReleases.map((release) => {
          const artistSlug = generateArtistSlug(
            release.basic_information.artists[0].name
          );
          const albumSlug = generateAlbumSlug(release.basic_information.title);
          return (
            <div key={release.id} className="track_item track_item_responsive">
              <div className="artist_image_wrapper">
                {release.basic_information.cover_image ? (
                  <a
                    href={`https://www.discogs.com/release/${release.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={release.basic_information.cover_image}
                      alt={release.basic_information.title}
                      className="artist_image loaded"
                    />
                  </a>
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
              </div>
              <div className="no-wrap-text">
                <p>
                  <Link href={`/artist/${artistSlug}`}>
                    <strong>{release.basic_information.artists[0].name}</strong>
                  </Link>
                  {' - '}
                  <Link href={`/album/${artistSlug}_${albumSlug}`}>
                    {release.basic_information.title}
                  </Link>
                </p>
                <p>
                  Format: {release.basic_information.formats[0]?.name || 'Unknown'}
                  <br />
                  Release Year: {release.original_year || release.basic_information.year}
                  <br />
                  Genres:{' '}
                  {(release.master_genres || release.basic_information.genres).join(', ')}
                  <br />
                  Styles:{' '}
                  {(release.master_styles || release.basic_information.styles).join(', ')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="track_ul2"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="button"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CollectionListPage;