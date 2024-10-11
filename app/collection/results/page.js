'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const CollectionResultsPage = () => {
  const searchParams = useSearchParams();
  const year = searchParams.get('year');
  const genre = searchParams.get('genre');
  const format = searchParams.get('format');

  const [collectionData, setCollectionData] = useState(null);
  const [topGenres, setTopGenres] = useState([]);
  const [topFormats, setTopFormats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (genre && format) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            'https://kv-fetch-discogs-all.rian-db8.workers.dev'
          );
          const data = await response.json();

          // Calculate top genres
          const genreCounts = data.data.releases.reduce((acc, release) => {
            release.basic_information.genres.forEach((genre) => {
              acc[genre] = (acc[genre] || 0) + 1;
            });
            return acc;
          }, {});

          const sortedGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
            .map(([genre]) => genre);

          const topGenres = ['All', ...sortedGenres, 'Other'];
          setTopGenres(topGenres);

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

          const topFormats = ['All', ...sortedFormats, 'Other'];
          setTopFormats(topFormats);

          setCollectionData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching Discogs collection:', error);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [year, genre, format]);

  if (loading || !collectionData) {
    return <div className="track_ul2">Loading releases...</div>;
  }

  const { data } = collectionData;

  // Filter releases based on year, genre, and format
  const filteredReleases = data.releases.filter((release) => {
    const releaseYear = release.original_year || release.basic_information.year;
    const genreMatch =
      genre === 'All' ||
      (genre === 'Other'
        ? !topGenres.slice(1, -1).some((g) =>
            release.basic_information.genres.includes(g)
          )
        : release.basic_information.genres.includes(genre));

    const formatName = release.basic_information.formats[0]?.name;
    const formatMatch =
      format === 'All' ||
      (format === 'Other'
        ? !topFormats.slice(1, -1).includes(formatName)
        : formatName === format);

    const yearMatch = !year || (releaseYear && releaseYear.toString() === year);

    return genreMatch && formatMatch && yearMatch;
  });

  return (
    <div>
      <h1>
        Releases {year ? `from ${year}` : ''}
        {genre !== 'All' && (
          <>
            {' '}
            in <strong>{genre}</strong> {genre === 'Other' ? 'genres' : 'genre'}
          </>
        )}
        {format !== 'All' && (
          <>
            {' '}
            on <strong>{format}</strong>{' '}
            {format === 'Other' ? 'formats' : 'format'}
          </>
        )}
      </h1>
      {filteredReleases.length > 0 ? (
        <div className="track_ul">
          {filteredReleases.map((release, index) => (
            <div key={index} className="track_item track_item_responsive">
              <div className="artist_image_wrapper">
                {release.basic_information.cover_image ? (
                  <img
                    src={release.basic_information.cover_image}
                    alt={release.basic_information.title}
                    className="artist_image loaded" // Ensure 'loaded' class is added
                  />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
              </div>
              <div className="no-wrap-text">
                <p>
                  <strong>{release.basic_information.title}</strong> by{' '}
                  {release.basic_information.artists
                    .map((artist) => artist.name)
                    .join(', ')}
                </p>
                <p>
                  Format:{' '}
                  {release.basic_information.formats
                    .map((format) => format.name)
                    .join(', ')}
                  <br />
                  Year: {release.original_year || release.basic_information.year}
                  <br />
                  Genres: {release.basic_information.genres.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No releases found for the selected filters.</p>
      )}
    </div>
  );
};

export default CollectionResultsPage;