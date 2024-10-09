'use client';

export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DiscogsStatsPage = () => {
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [topGenres, setTopGenres] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://kv-fetch-discogs-all.rian-db8.workers.dev');
        const data = await response.json();
        setCollectionData(data);

        // Calculate top 7 genres
        const genreCounts = data.data.releases.reduce((acc, release) => {
          release.basic_information.genres.forEach(genre => {
            acc[genre] = (acc[genre] || 0) + 1;
          });
          return acc;
        }, {});

        const sortedGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7)
          .map(([genre]) => genre);

        setTopGenres(['All', ...sortedGenres, 'Other']);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Discogs collection:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="track_ul2">Loading collection data...</div>;
  }

  if (!collectionData) {
    return <div className="track_ul2">Error loading collection data</div>;
  }

  const { stats, data } = collectionData;

  // Filter releases based on selected genre
  const filteredReleases = data.releases.filter(release => {
    if (selectedGenre === 'All') return true;
    if (selectedGenre === 'Other') return !topGenres.slice(1, -1).some(genre => release.basic_information.genres.includes(genre));
    return release.basic_information.genres.includes(selectedGenre);
  });

  // Prepare data for genre distribution chart
  const genreCounts = filteredReleases.reduce((acc, release) => {
    release.basic_information.genres.forEach(genre => {
      if (selectedGenre === 'All' || genre === selectedGenre || (selectedGenre === 'Other' && !topGenres.slice(1, -1).includes(genre))) {
        acc[genre] = (acc[genre] || 0) + 1;
      }
    });
    return acc;
  }, {});

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const otherGenreCount = Object.values(genreCounts).reduce((sum, count) => sum + count, 0) -
    sortedGenres.reduce((sum, [, count]) => sum + count, 0);

  const genreData = [
    ...sortedGenres.map(([name, value]) => ({ name, value })),
    { name: 'Other', value: otherGenreCount }
  ];

  const totalFilteredReleases = filteredReleases.length;
  genreData.forEach(item => {
    item.percentage = ((item.value / totalFilteredReleases) * 100).toFixed(1) + '%';
  });

  // Prepare data for format distribution chart
  const formatCounts = filteredReleases.reduce((acc, release) => {
    release.basic_information.formats.forEach(format => {
      acc[format.name] = (acc[format.name] || 0) + 1;
    });
    return acc;
  }, {});

  const sortedFormats = Object.entries(formatCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const otherFormatCount = Object.values(formatCounts).reduce((sum, count) => sum + count, 0) -
    sortedFormats.reduce((sum, [, count]) => sum + count, 0);

  const formatData = [
    ...sortedFormats.map(([name, value]) => ({ name, value })),
    { name: 'Other', value: otherFormatCount }
  ];

  formatData.forEach(item => {
    item.percentage = ((item.value / totalFilteredReleases) * 100).toFixed(1) + '%';
  });

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
  const releasesByYear = filteredReleases.reduce((acc, release) => {
    const year = release.basic_information.year;
    if (year) {
      acc[year] = (acc[year] || 0) + 1;
    }
    return acc;
  }, {});

  const yearData = Object.entries(releasesByYear)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  const COLORS = ['#FF6C00', '#FFA500', '#FFD700', '#FF4500', '#FF8C00', '#FF7F50', '#FF69B4', '#FF1493', '#4B0082'];

  return (
    <div>
      <header>
        <h1>Discogs Collection Statistics</h1>
      </header>
      <main>
        <section id="discogs-stats">
          <div className="track_ul2">
            <p>
              My Discogs collection contains <strong className="highlight">{totalFilteredReleases} releases</strong>
              {selectedGenre !== 'All' && <> in the <strong className="highlight">{selectedGenre}</strong> {selectedGenre === 'Other' ? 'genres' : 'genre'}</>}.
              <br />Data last updated: {new Date(stats.lastUpdated).toLocaleString()}
            </p>
            <div>
              <label htmlFor="genre-select">Filter by Genre: </label>
              <select 
                id="genre-select" 
                value={selectedGenre} 
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="genre-select"
              >
                {topGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

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
                  label={({ name, percentage }) => `${name}: ${percentage}`}
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${props.payload.percentage} (${value})`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

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
                  label={({ name, percentage }) => `${name}: ${percentage}`}
                >
                  {formatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${props.payload.percentage} (${value})`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <h2>Top 10 Artists</h2>
          <div className="track_ul2" style={{ height: '500px', minWidth: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={artistData}
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={140}
                  tickFormatter={(value) => value.length > 20 ? value.substr(0, 18) + '...' : value}
                />
                <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                <Legend />
                <Bar dataKey="value" fill="#FF6C00" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2>Releases by Year</h2>
          <div className="track_ul2" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF6C00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DiscogsStatsPage;