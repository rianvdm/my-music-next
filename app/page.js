'use client';

export const runtime = 'edge';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateArtistSlug, generateAlbumSlug, generateLastfmArtistSlug } from './utils/slugify';
import { genres } from './utils/genres';

// Custom hooks for data fetching
const useRandomFact = () => {
  const [fact, setFact] = useState('Did you know');

  useEffect(() => {
    const fetchRandomFact = async () => {
      try {
        const response = await fetch('https://kv-fetch-random-fact.rian-db8.workers.dev/');
        const factData = await response.json();
        setFact(factData.data);
      } catch (error) {
        console.error('Error fetching random fact:', error);
        setFact('Did you know? There was an error loading a random fact.');
      }
    };

    fetchRandomFact();
  }, []);

  return fact;
};

const useRandomGenre = () => {
  const [genreData, setGenreData] = useState({ urlGenre: null, displayGenre: null });

  useEffect(() => {
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];

    // Capitalize the first letter of each word and replace hyphens with spaces
    const displayGenre = randomGenre
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    setGenreData({ urlGenre: randomGenre, displayGenre });
  }, []);

  return genreData;
};

const useRecentSearches = () => {
  const [searches, setSearches] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const response = await fetch('https://kv-fetch-recentsearches.rian-db8.workers.dev/');
        const data = await response.json();
        setSearches(data.data);
      } catch (error) {
        console.error('Error fetching recent searches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSearches();
  }, []);

  return { searches, isLoading };
};

const useRecentTracks = () => {
  const [recentTracks, setRecentTracks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTracks = async () => {
      try {
        const response = await fetch('https://kv-fetch-last-track.rian-db8.workers.dev/');
        const data = await response.json();
        setRecentTracks(data);
      } catch (error) {
        console.error('Error fetching recent tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentTracks();
  }, []);

  return { recentTracks, isLoading };
};

// Subcomponents
const DayGreeting = () => {
  const options = { weekday: 'long' };
  const dayName = new Intl.DateTimeFormat('en-US', options).format(new Date());
  return <h1>Happy {dayName}, friend!</h1>;
};

const AlbumSearch = () => {
  const [formData, setFormData] = useState({ album: '', artist: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = useCallback((e) => {
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
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Enter album name..."
      />
      <input
        id="artist-name"
        type="text"
        value={formData.artist}
        onChange={handleChange}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Enter artist name..."
      />
      <button className="button" onClick={handleSearch} style={{ width: '100px' }}>
        Search
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

const RecentTrackDisplay = ({ recentTracks, isLoading }) => {
  const [artistSummary, setArtistSummary] = useState(null);

  useEffect(() => {
    if (recentTracks?.last_artist) {
      const fetchArtistSummary = async () => {
        try {
          const encodedArtistName = encodeURIComponent(recentTracks.last_artist);
          const summaryResponse = await fetch(`https://api-openai-artistsentence.rian-db8.workers.dev?name=${encodedArtistName}`);
          const summaryData = await summaryResponse.json();
          setArtistSummary(summaryData.data);
        } catch (error) {
          console.error('Error fetching artist summary:', error);
        }
      };
      fetchArtistSummary();
    }
  }, [recentTracks]);

  if (isLoading) return <div className="track_ul2">Loading recent tracks...</div>;
  if (!recentTracks) return null;

  const { last_artist, last_album } = recentTracks;
  const artistSlug = generateLastfmArtistSlug(last_artist);
  const albumSlug = generateAlbumSlug(last_album);

  return (
    <p>
      I recently listened to{' '}
      <Link href={`album/${generateArtistSlug(last_artist)}_${albumSlug}`}>
        <strong>{last_album}</strong>
      </Link>{' '}
      by{' '}
      <Link href={`artist/${artistSlug}`}>
        <strong>{last_artist}</strong>
      </Link>
      . {artistSummary}
      <br/><br/>
      There's some more history in <a href="/mystats">my stats</a>.
    </p>
  );
};

const RecentSearches = ({ searches, isLoading }) => {
  if (isLoading) return <div className="track_ul2">Loading recent searches...</div>;
  if (!searches?.length) return null;

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
};

// Main component
export default function Home() {
  const randomFact = useRandomFact();
  const { urlGenre, displayGenre } = useRandomGenre();
  const { searches, isLoading: isLoadingSearches } = useRecentSearches();
  const { recentTracks, isLoading: isLoadingTracks } = useRecentTracks();

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
            . Or maybe explore a random genre like{' '}
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
              Here are some albums that <Link href="/about">Discord Bot</Link> users recently shared with their friends.
            </strong>
          </p>
          <br />
          <RecentSearches searches={searches} isLoading={isLoadingSearches} />

          <h3 style={{ marginTop: '3.5em' }}>My listening history</h3>
          <RecentTrackDisplay recentTracks={recentTracks} isLoading={isLoadingTracks} />
        </section>
      </main>
    </div>
  );
}