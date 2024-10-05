'use client';

export const runtime = 'edge';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { generateArtistSlug, generateAlbumSlug, generateLastfmArtistSlug } from '../utils/slugify';

const useRecentTracks = () => {
  const [recentTracks, setRecentTracks] = useState(null);
  const [listeningStats, setListeningStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTracks = async () => {
      try {
        const response = await fetch('https://kv-fetch-last-track.rian-db8.workers.dev/');
        const data = await response.json();
        setRecentTracks(data);
      } catch (error) {
        console.error('Error fetching recent tracks:', error);
      }
    };

    const fetchListeningStats = async () => {
      try {
        const response = await fetch('https://kv-fetch-lastfm-stats.rian-db8.workers.dev/');
        const statsData = await response.json();
        setListeningStats(statsData);
      } catch (error) {
        console.error('Error fetching listening stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentTracks();
    fetchListeningStats();
  }, []);

  return { recentTracks, listeningStats, isLoading };
};

const RecentTrackDisplay = ({ recentTracks, listeningStats, isLoading }) => {
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
  if (!recentTracks || !listeningStats) return null;

  const { last_artist, last_album } = recentTracks;
  const artistSlug = generateLastfmArtistSlug(last_artist);
  const albumSlug = generateAlbumSlug(last_album);

  return (
        <p>
          Over the last week I listened to{' '}
          <strong className="highlight">{listeningStats.totalTracks} tracks</strong> across{' '}
          <strong className="highlight">{listeningStats.uniqueArtists} artists</strong> and{' '}
          <strong className="highlight">{listeningStats.uniqueAlbums} albums</strong>. Most recently I listened to{' '}
          <Link href={`/album/${generateArtistSlug(last_artist)}_${albumSlug}`}>
            <strong>{last_album}</strong>
          </Link>{' '}
          by{' '}
          <Link href={`/artist/${artistSlug}`}>
            <strong>{last_artist}</strong>
          </Link>
          . {artistSummary}
        </p>
  );
};

export default function MyStats() {
  const [topArtistsData, setTopArtistsData] = useState(null);
  const [topAlbumsData, setTopAlbumsData] = useState(null);
  const { recentTracks, listeningStats, isLoading: isLoadingTracks } = useRecentTracks();

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const topArtistsResponse = await fetch('https://kv-fetch-top-artists.rian-db8.workers.dev/');
        const topArtistsData = await topArtistsResponse.json();
        setTopArtistsData(topArtistsData);
      } catch (error) {
        console.error('Error fetching top artists:', error);
      }
    };

    const fetchTopAlbums = async () => {
      try {
        const topAlbumsResponse = await fetch('https://kv-fetch-top-albums.rian-db8.workers.dev/');
        const topAlbumsData = await topAlbumsResponse.json();
        setTopAlbumsData(topAlbumsData);
      } catch (error) {
        console.error('Error fetching top albums:', error);
      }
    };

    fetchTopArtists();
    fetchTopAlbums();
  }, []);

  const renderTopArtists = () => {
    if (!topArtistsData) {
      return <p>Loading artists...</p>;
    }

    return (
      <div className="track-grid">
        {topArtistsData.map(artist => {
          const artistSlug = generateArtistSlug(artist.name);
          const genre = artist.tags[0] || 'No genre';
          return (
            <div className="track" key={artist.name}>
              <Link href={`artist/${artistSlug}`} rel="noopener noreferrer">
                <img src={artist.image || '/path/to/default/image.png'} className="track_image" alt={artist.name} />
              </Link>
              <div className="track_content">
                <p className="track_artist">
                  <strong><Link href={`artist/${artistSlug}`} rel="noopener noreferrer">
                    {artist.name}
                  </Link></strong>
                  <br />
                  <Link href={`genre/${genre}`} rel="noopener noreferrer">{genre}</Link>
                  <br />
                  <span className="track_playcount"> {artist.playcount} plays</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTopAlbums = () => {
    if (!topAlbumsData) {
      return <p>Loading albums...</p>;
    }

    return (
      <div className="track-grid">
        {topAlbumsData.map(album => {
          const artistSlug = generateArtistSlug(album.artist);
          const albumSlug = generateAlbumSlug(album.name);

          return (
            <div className="track" key={album.name}>
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
                  <br />
                  <span className="track_playcount"> {album.playcount} plays</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <header>
        <h1>Real-time listening stats</h1>
      </header>
      <main>
        <section id="lastfm-stats">
          <h2>🎧 Recent Listening</h2>
          <RecentTrackDisplay recentTracks={recentTracks} listeningStats={listeningStats} isLoading={isLoadingTracks} />

          <h2>👩‍🎤 Top Artists</h2>
          <p style={{ textAlign: 'center' }}>
            <strong>The top artists I listened to in the past 7 days.</strong>
          </p>
          {renderTopArtists()}

          <h2>🏆 Top Albums</h2>
          <p style={{ textAlign: 'center' }}>
            <strong>The top albums I listened to in the past 7 days.</strong>
          </p>
          {renderTopAlbums()}
        </section>
      </main>
    </div>
  );
}