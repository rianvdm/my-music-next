'use client';

export const runtime = 'edge';
import { useEffect, useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useRouter, useSearchParams } from 'next/navigation';
import GenreFilter from '../components/GenreFilter';
import FormatFilter from '../components/FormatFilter';
import DecadeFilter from '../components/DecadeFilter';

const DiscogsStatsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGenre = searchParams.get('genre') || 'All';
  const initialFormat = searchParams.get('format') || 'All';
  const initialDecade = searchParams.get('decade') || 'All';

  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedFormat, setSelectedFormat] = useState(initialFormat);
  const [selectedDecade, setSelectedDecade] = useState(initialDecade);
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topGenres, setTopGenres] = useState([]);
  const [topFormats, setTopFormats] = useState([]);
  const [decades, setDecades] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://kv-fetch-discogs-all.rian-db8.workers.dev'
        );
        const data = await response.json();
        setCollectionData(data);

        // Calculate top 7 genres
        const genreCounts = data.data.releases.reduce((acc, release) => {
          const genres = release.master_genres && Array.isArray(release.master_genres) 
            ? release.master_genres 
            : release.basic_information.genres;

          if (genres && Array.isArray(genres)) {
            genres.forEach((genre) => {
              acc[genre] = (acc[genre] || 0) + 1;
            });
          }

          return acc;
        }, {});

        const sortedGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7)
          .map(([genre]) => genre);

        setTopGenres(['All', ...sortedGenres, 'Other']);

        // Calculate top 5 formats
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

        setTopFormats(['All', ...sortedFormats, 'Other']);

        // Calculate decades
        const years = data.data.releases
          .map(release => release.original_year || release.basic_information.year)
          .filter(year => year);
        const decadesSet = new Set();
        years.forEach(year => {
          const decade = Math.floor(year / 10) * 10;
          decadesSet.add(decade);
        });

        const decadesArray = Array.from(decadesSet).sort((a, b) => a - b).map(decade => decade.toString());
        setDecades(['All', ...decadesArray]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching Discogs collection:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Update the URL when filters change
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
    const queryString = queryParams.toString();
    const newUrl =
      window.location.pathname + (queryString ? `?${queryString}` : '');

    const currentUrl = window.location.pathname + window.location.search;

    // Only update the URL if it has changed
    if (newUrl !== currentUrl) {
      router.replace(newUrl);
    }
  }, [selectedGenre, selectedFormat, selectedDecade, router]);

  if (loading) {
    return <div className="track_ul2">Loading collection data...</div>;
  }

  if (!collectionData) {
    return <div className="track_ul2">Error loading collection data</div>;
  }

  const { stats, data } = collectionData;

  // Filter releases based on selected genre, format, and decade
  const filteredReleases = data.releases.filter((release) => {
    const genres = release.master_genres && Array.isArray(release.master_genres) 
      ? release.master_genres 
      : release.basic_information.genres;

    const genreMatch =
      selectedGenre === 'All' ||
      (selectedGenre === 'Other'
        ? !topGenres.slice(1, -1).some((genre) => genres?.includes(genre))
        : genres?.includes(selectedGenre));

    const format = release.basic_information.formats[0]?.name;
    const formatMatch =
      selectedFormat === 'All' ||
      (selectedFormat === 'Other'
        ? !topFormats.slice(1, -1).includes(format)
        : format === selectedFormat);

    const releaseYear = release.original_year || release.basic_information.year;
    const releaseDecade = releaseYear ? Math.floor(releaseYear / 10) * 10 : null;
    const decadeMatch =
      selectedDecade === 'All' ||
      (releaseDecade && releaseDecade.toString() === selectedDecade);

    return genreMatch && formatMatch && decadeMatch;
  });

  // Prepare data for genre distribution chart
  const genreCounts = filteredReleases.reduce((acc, release) => {
    const genres = release.master_genres && Array.isArray(release.master_genres)
      ? release.master_genres
      : release.basic_information.genres;

    if (genres && Array.isArray(genres)) {
      genres.forEach((genre) => {
        if (
          selectedGenre === 'All' || 
          genre === selectedGenre || 
          (selectedGenre === 'Other' && !topGenres.slice(1, -1).includes(genre))
        ) {
          acc[genre] = (acc[genre] || 0) + 1;
        }
      });
    }

    return acc;
  }, {});

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const otherGenreCount = Object.values(genreCounts).reduce((sum, count) => sum + count, 0) -
    sortedGenres.reduce((sum, [, count]) => sum + count, 0);

  const totalGenreCount = sortedGenres.reduce((sum, [, count]) => sum + count, 0) + otherGenreCount;

  const genreData = [
    ...sortedGenres.map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalGenreCount) * 100)
    })),
    {
      name: 'Other',
      value: otherGenreCount,
      percentage: Math.round((otherGenreCount / totalGenreCount) * 100)
    }
  ];

  // Prepare data for format distribution chart
  const formatCounts = filteredReleases.reduce((acc, release) => {
    const format = release.basic_information.formats[0]?.name;
    if (format) {
      acc[format] = (acc[format] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedFormats = Object.entries(formatCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const otherFormatCount = Object.values(formatCounts).reduce((sum, count) => sum + count, 0) -
    sortedFormats.reduce((sum, [, count]) => sum + count, 0);

  const totalFormatCount = sortedFormats.reduce((sum, [, count]) => sum + count, 0) + otherFormatCount;

  const formatData = [
    ...sortedFormats.map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalFormatCount) * 100)
    })),
    {
      name: 'Other',
      value: otherFormatCount,
      percentage: Math.round((otherFormatCount / totalFormatCount) * 100)
    }
  ];

  // Prepare data for top 10 artists chart
  const artistCounts = filteredReleases.reduce((acc, release) => {
    release.basic_information.artists.forEach(artist => {
      const artistName = artist.name;
      acc[artistName] = (acc[artistName] || 0) + 1;
    });
    return acc;
  }, {});

  const sortedArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const artistData = sortedArtists.map(([name, value]) => ({ name, value }));

  // Prepare data for releases by year chart
  let totalWithOriginalYear = 0;
  const releasesByYear = filteredReleases.reduce((acc, release) => {
    // Prioritize original_year, fall back to basic_information.year if original_year is not available
    const year = release.original_year || release.basic_information.year;
    if (year) {
      acc[year] = (acc[year] || 0) + 1;
    }

    // Count items with original_year
    if (release.original_year) {
      totalWithOriginalYear++;
    }

    return acc;
  }, {});

  // Find the min and max years
  const years = Object.keys(releasesByYear).map(Number);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const percentageWithOriginalYear = (totalWithOriginalYear / filteredReleases.length * 100).toFixed(2);

  const COLORS = ['#FF6C00', '#FFA500', '#FFD700', '#FF4500', '#FF8C00', '#FF7F50', '#FF69B4', '#FF1493', '#4B0082'];

  // Create an array with all years in the range
  const yearData = [];
  for (let year = minYear; year <= maxYear; year++) {
    yearData.push({
      year: year,
      count: releasesByYear[year] || 0
    });
  }

  function generateYearTicks(minYear, maxYear) {
    const yearRange = maxYear - minYear;
    const tickCount = Math.min(10, yearRange); // Limit to 10 ticks maximum
    const yearStep = Math.ceil(yearRange / tickCount);

    const ticks = [];
    for (let year = minYear; year <= maxYear; year += yearStep) {
      ticks.push(year);
    }
    if (ticks[ticks.length - 1] !== maxYear) {
      ticks.push(maxYear);
    }
    return ticks;
  }

  const handleShowReleases = () => {
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
    const queryString = queryParams.toString();
    router.push(`/collection/all${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div>
      <header>
        <h1>Physical Collection Stats</h1>
      </header>
      <main>
        <section id="discogs-stats">
          <div className="track_ul2">
            <p>
              My{' '}
              <a href="https://www.discogs.com/user/elezea-records/collection" target="_blank" rel="noopener noreferrer">
                physical music collection
              </a>{' '}
              contains{' '}
              <strong className="highlight">
                {filteredReleases.length} releases
              </strong>
              {selectedGenre !== 'All' && (
                <>
                  {' '}
                  in the <strong className="highlight">{selectedGenre}</strong>{' '}
                  {selectedGenre === 'Other' ? 'genres' : 'genre'}
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
                gap: '2rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {/* Replacing Inline Filters with Reusable Components */}
              <GenreFilter
                selectedGenre={selectedGenre}
                uniqueGenres={topGenres}
                onChange={(e) => setSelectedGenre(e.target.value)}
              />
              <FormatFilter
                selectedFormat={selectedFormat}
                uniqueFormats={topFormats}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <DecadeFilter
                selectedDecade={selectedDecade}
                uniqueDecades={decades}
                onChange={(e) => setSelectedDecade(e.target.value)}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={handleShowReleases} className="button" style={{ marginLeft: '0' }}>
                Show releases &gt;&gt;
              </button>
            </div>
          </div>

          {selectedGenre === 'All' && (
            <>
              <h2>Genre Distribution</h2>
              <div className="track_ul2" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${props.payload.percentage}% (${value})`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {selectedFormat === 'All' && (
            <>
              <h2>Format Distribution</h2>
              <div className="track_ul2" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {formatData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${props.payload.percentage}% (${value})`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          <h2>Top 10 Artists</h2>
          <div className="track_ul2" style={{ height: '500px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={artistData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tickFormatter={(value) => value.length > 15 ? value.substr(0, 13) + '...' : value}
                />
                <Tooltip 
                  formatter={(value, name, props) => [value]}
                  wrapperStyle={{ width: 200, backgroundColor: '#ccc' }}
                />
                <Legend />
                <Bar dataKey="value" fill="#FF6C00" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2>Releases by Original Release Year</h2>
          <div className="track_ul2" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year"
                  type="number"
                  domain={[minYear, maxYear]}
                  ticks={generateYearTicks(minYear, maxYear)}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#FF6C00"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p>
            <br />
            <em>
              <a
                href="https://www.discogs.com/user/elezea-records/collection"
                target="_blank"
                rel="noopener noreferrer"
              >
                Data from Discogs
              </a>{' '}
              last updated{' '}
              {new Intl.DateTimeFormat('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }).format(new Date(stats.lastUpdated))}
              {'.'}
            </em>
          </p>
        </section>
      </main>
    </div>
  );
};

export default DiscogsStatsPage;