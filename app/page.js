'use client';

export const runtime = 'edge';

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateArtistSlug, generateAlbumSlug } from './utils/slugify';
import { useRandomFact, useRandomGenre, useRecentSearches } from './hooks';

// Subcomponents
const DayGreeting = memo(() => {
  const options = { weekday: 'long' };
  const dayName = new Intl.DateTimeFormat('en-US', options).format(new Date());
  return <h1>Happy {dayName}, friend!</h1>;
});

DayGreeting.displayName = 'DayGreeting';

const AlbumSearch = () => {
  const [formData, setFormData] = useState({ album: '', artist: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = useCallback(e => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.split('-')[0]]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    const { album, artist } = formData;
    if (!album.trim() || !artist.trim()) {
      setError('Please enter both album and artist names.');
      return;
    }

    const formattedArtist = generateArtistSlug(artist);
    const formattedAlbum = generateAlbumSlug(album);
    router.push(`/album/${formattedArtist}_${formattedAlbum}`);
  }, [formData, router]);

  return (
    <div id="search-form">
      <input
        id="album-name"
        type="text"
        value={formData.album}
        onChange={handleChange}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Enter album name..."
      />
      <input
        id="artist-name"
        type="text"
        value={formData.artist}
        onChange={handleChange}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Enter artist name..."
      />
      <button className="button" onClick={handleSearch} style={{ width: '100px' }}>
        Search
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

const RecentSearches = memo(({ searches, isLoading }) => {
  if (isLoading) {
    return <div className="track_ul2">Loading recent searches...</div>;
  }
  if (!searches?.length) {
    return null;
  }

  return (
    <div className="track-grid">
      {searches.map(album => {
        const artistSlug = generateArtistSlug(album.artist);
        const albumSlug = generateAlbumSlug(album.name);

        return (
          <div className="track" key={album.id}>
            <Link href={`/album/${artistSlug}_${albumSlug}`}>
              <img src={album.image} className="track_image" alt={album.name} />
            </Link>
            <div className="track_content">
              <p className="track_name">
                <Link href={`/album/${artistSlug}_${albumSlug}`}>
                  <strong>{album.name}</strong>
                </Link>
              </p>
              <p className="track_artist">
                <Link href={`artist/${artistSlug}`}>{album.artist}</Link>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

RecentSearches.displayName = 'RecentSearches';

// Main component
export default function Home() {
  const randomFact = useRandomFact();
  const { urlGenre, displayGenre } = useRandomGenre();
  const { searches, isLoading: isLoadingSearches } = useRecentSearches();

  return (
    <div>
      <header>
        <DayGreeting />
      </header>
      <main>
        <section id="lastfm-stats">
          <p>
            ✨ Welcome, music traveler. If you're looking for something new to listen to, you should{' '}
            <strong>
              <Link href="/recommendations">get rec'd</Link>
            </strong>
            . Or maybe explore the history and seminal albums of a random genre like{' '}
            <strong>
              <Link href={`/genre/${urlGenre}`}>{displayGenre}</Link>
            </strong>
            .
          </p>
          <p>🧠 {randomFact}</p>

          <h2 style={{ marginBottom: 0, marginTop: '2em' }}>💿 Learn more about an album</h2>
          <AlbumSearch />

          <h2>👀 From the community</h2>
          <p style={{ textAlign: 'center' }}>
            <strong>
              Here are some albums that <Link href="/about">Discord Bot</Link> users recently shared
              with their friends.
            </strong>
          </p>
          <br />
          <RecentSearches searches={searches} isLoading={isLoadingSearches} />
        </section>
      </main>
    </div>
  );
}
