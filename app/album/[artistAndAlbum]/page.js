// ABOUTME: Dynamic album detail page that displays comprehensive information about a specific album
// ABOUTME: Fetches album data from Spotify, streaming links, AI-generated descriptions, and user collection status
'use client';

export const runtime = 'edge';

import React, { useEffect, useState, useRef } from 'react';
import LazyMarkdown from '../../../components/ui/LazyMarkdown';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Link from 'next/link';
import {
  generateArtistSlug,
  generateAlbumSlug,
  generateLastfmArtistSlug,
  generateGenreSlug,
} from '../../utils/slugify';

export default function AlbumPage({ params }) {
  const { artistAndAlbum } = params;
  const [albumDetails, setAlbumDetails] = useState(null);
  const [streamingUrls, setStreamingUrls] = useState({
    spotify: '',
    appleMusic: '',
    youtube: '',
    songLink: '',
  });
  const [releaseYear, setReleaseYear] = useState('Loading...');
  const [trackCount, setTrackCount] = useState('Loading...');
  const [genres, setGenres] = useState('Loading...');
  const [openAISummary, setOpenAISummary] = useState({
    content: 'Generating summary...',
    citations: [],
  });
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);
  const [artistId, setArtistId] = useState(null);
  const [error, setError] = useState(null);
  const [kvKey, setKvKey] = useState(null);
  const fetchedOpenAISummary = useRef(false);
  const fetchedRecommendations = useRef(false); // New ref to track recommendation fetching
  const timerRef = useRef(null);
  const [recommendation, setRecommendation] = useState('Loading recommendations...');
  const [loadingRecommendation, setLoadingRecommendation] = useState(true);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [followUpResponse, setFollowUpResponse] = useState('');
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);

  const decodePrettyUrl = prettyUrl => decodeURIComponent(prettyUrl.replace(/-/g, ' '));

  // Updated URL parsing logic
  const parseArtistAndAlbum = urlSegment => {
    // First try to split by underscore
    let parts = urlSegment.split('_');

    // If there's no underscore, try to intelligently split the hyphenated string
    if (parts.length === 1) {
      // Find the last occurrence of '-by-' or split in the middle if not found
      const byIndex = urlSegment.toLowerCase().lastIndexOf('-by-');
      if (byIndex !== -1) {
        parts = [
          urlSegment.slice(byIndex + 4), // artist (after '-by-')
          urlSegment.slice(0, byIndex), // album (before '-by-')
        ];
      } else {
        // If no '-by-', split at the middle hyphen
        const hyphens = urlSegment.split('-');
        const middleIndex = Math.floor(hyphens.length / 2);
        parts = [hyphens.slice(0, middleIndex).join('-'), hyphens.slice(middleIndex).join('-')];
      }
    }

    return {
      prettyArtist: parts[0] || '',
      prettyAlbum: parts[1] || parts[0], // fallback to full string if no album part
    };
  };

  const { prettyArtist, prettyAlbum } = parseArtistAndAlbum(artistAndAlbum);
  const artist = decodePrettyUrl(prettyArtist);
  const album = decodePrettyUrl(prettyAlbum);

  // Timer effect for showing extended message after 3 seconds
  useEffect(() => {
    if (openAISummary.content === 'Generating summary...') {
      timerRef.current = setTimeout(() => {
        setShowExtendedMessage(true);
      }, 3000); // Show extended message after 3 seconds

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [openAISummary]);

  // Fetch album details
  useEffect(() => {
    if (artist && album) {
      async function fetchAlbumData() {
        try {
          const spotifyQuery = `album:"${album}" artist:${artist}`;
          const spotifyResponse = await fetch(
            `https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(
              spotifyQuery
            )}&type=album`
          );
          const spotifyData = await spotifyResponse.json();

          if (spotifyData.data && spotifyData.data.length > 0) {
            const spotifyAlbum = spotifyData.data[0];
            setAlbumDetails(spotifyAlbum);

            setStreamingUrls(prevUrls => ({
              ...prevUrls,
              spotify: spotifyAlbum.url,
            }));

            const releaseDate = spotifyAlbum.releaseDate;
            if (releaseDate) {
              setReleaseYear(releaseDate.split('-')[0]);
            }
            setTrackCount(spotifyAlbum.tracks || 'Unknown');

            if (spotifyAlbum.artistIds && spotifyAlbum.artistIds.length > 0) {
              setArtistId(spotifyAlbum.artistIds[0]);
            }

            const songLinkResponse = await fetch(
              `https://api-songlink.rian-db8.workers.dev/?url=${encodeURIComponent(
                spotifyAlbum.url
              )}`
            );
            const songLinkData = await songLinkResponse.json();
            setStreamingUrls(prevUrls => ({
              ...prevUrls,
              songLink: songLinkData.pageUrl,
              appleMusic: songLinkData.appleUrl,
              youtube: songLinkData.youtubeUrl,
            }));

            // Fetch OpenAI summary using the album and artist from Spotify
            fetchOpenAISummary(spotifyAlbum.name, spotifyAlbum.artist);
          } else {
            throw new Error('Album not found');
          }
        } catch (error) {
          console.error('Error fetching album data:', error);
          setError('Album not found.');
        }
      }
      fetchAlbumData();
    }
  }, [artist, album]);

  // Fetch OpenAI summary with Spotify album details
  const fetchOpenAISummary = async (albumName, artistName) => {
    if (albumName && artistName && !fetchedOpenAISummary.current) {
      fetchedOpenAISummary.current = true;
      try {
        const summaryResponse = await fetch(
          `https://api-perplexity-albumdetail.rian-db8.workers.dev?album=${encodeURIComponent(
            albumName
          )}&artist=${encodeURIComponent(artistName)}`
        );
        const summaryData = await summaryResponse.json();
        setOpenAISummary({
          content: summaryData.data.content,
          citations: summaryData.data.citations,
        });
        setKvKey(summaryData.kvKey);
      } catch (error) {
        console.error('Error fetching OpenAI summary:', error);
        setOpenAISummary({ content: 'Failed to load summary.', citations: [] });
      }
    }
  };

  // Fetch genres as soon as artist ID is available
  useEffect(() => {
    if (artistId) {
      async function fetchArtistGenres() {
        try {
          const artistDetailsResponse = await fetch(
            `https://api-spotify-artists.rian-db8.workers.dev/?id=${artistId}`
          );
          const artistDetailsData = await artistDetailsResponse.json();
          const fetchedGenres = artistDetailsData.data.genres || [];
          setGenres(fetchedGenres.slice(0, 3).join(', ') || 'Unknown');
        } catch (error) {
          console.error('Error fetching artist genres:', error);
          setGenres('Failed to load genres');
        }
      }
      fetchArtistGenres();
    }
  }, [artistId]);

  // Automatically fetch recommendations on page load, ensuring it's only fetched once
  useEffect(() => {
    if (!fetchedRecommendations.current) {
      fetchedRecommendations.current = true; // Ensure this block only runs once
      const fetchRecommendations = async () => {
        try {
          const response = await fetch(
            `https://api-perplexity-albumrecs.rian-db8.workers.dev/?album=${encodeURIComponent(
              album
            )}&artist=${encodeURIComponent(artist)}`
          );
          const data = await response.json();
          setRecommendation(data.data);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          setRecommendation('Failed to load recommendations.');
        } finally {
          setLoadingRecommendation(false);
        }
      };

      fetchRecommendations();
    }
  }, [album, artist]);

  const renderOpenAISummary = summary => {
    if (summary.content === 'Generating summary...') {
      return (
        <div>
          <LoadingSpinner variant="generating" showSpinner={true} />
          {showExtendedMessage && (
            <span>
              {
                " It's taking a little while to make sure the robots don't say dumb things, but hang in there, it really is coming..."
              }
            </span>
          )}
        </div>
      );
    }

    // Replace [n] with clickable links
    const contentWithClickableCitations = summary.content.replace(/\[(\d+)\]/g, (match, num) => {
      const index = parseInt(num) - 1;
      if (summary.citations && summary.citations[index]) {
        return `[<a href="${summary.citations[index]}" target="_blank" rel="noopener noreferrer">${num}</a>]`;
      }
      return match;
    });

    return (
      <div>
        <LazyMarkdown content={contentWithClickableCitations} />
        {summary.citations && summary.citations.length > 0 && (
          <div className="citations">
            <h4>Sources</h4>
            <ul>
              {summary.citations.map((citation, index) => (
                <li key={index}>
                  <span className="citation-number">[{index + 1}]</span>{' '}
                  <a href={citation} target="_blank" rel="noopener noreferrer">
                    {new URL(citation).hostname.replace('www.', '')}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderFollowUpResponse = response => {
    return <LazyMarkdown content={response} />;
  };

  if (error) {
    return (
      <p>
        {error} This either means it's not available to stream, or I am doing something wrong with
        the search. Please{' '}
        <Link href="https://github.com/rianvdm/my-music-next/issues">submit a bug report</Link> and
        let me know what you searched for! <br />
        <br />
        You can also <a href="/album">try the search manually</a> and see if that works.
      </p>
    );
  }

  if (!albumDetails) {
    return <LoadingSpinner variant="content" size="large" showSpinner={true} />;
  }

  const prettySpotifyArtist = generateLastfmArtistSlug(albumDetails.artist);
  const albumImage = albumDetails.image || 'https://file.elezea.com/noun-no-image.png';

  return (
    <div>
      <header>
        <h1>
          {albumDetails.name} by{' '}
          <Link href={`/artist/${prettySpotifyArtist}`}>{albumDetails.artist}</Link>
        </h1>
      </header>
      <main>
        <section className="track_ul2">
          <div className="image-text-wrapper">
            <img
              src={albumImage}
              alt={albumDetails.name}
              style={{ maxWidth: '100%', width: '220px', height: 'auto' }}
            />
            <div className="no-wrap-text">
              <p>
                <strong>Released:</strong>{' '}
                {releaseYear === 'Loading...' ? <LoadingSpinner variant="inline" /> : releaseYear}
              </p>
              <p>
                <strong>Genres:</strong>{' '}
                {genres === 'Loading...' ? (
                  <LoadingSpinner variant="inline" />
                ) : genres !== 'Unknown' ? (
                  genres.split(', ').map((genre, index) => {
                    const genreSlug = generateGenreSlug(genre);
                    return (
                      <span key={index}>
                        <Link href={`/genre/${genreSlug}`}>{genre}</Link>
                        {index < genres.split(', ').length - 1 ? ' | ' : ''}
                      </span>
                    );
                  })
                ) : (
                  genres
                )}
              </p>
              <p>
                <strong>Streaming:</strong>
                <br />
                {streamingUrls.spotify ? (
                  <a href={streamingUrls.spotify} target="_blank" rel="noopener noreferrer">
                    Spotify ↗
                  </a>
                ) : (
                  <LoadingSpinner variant="inline" />
                )}
                <br />
                {streamingUrls.appleMusic === '' ? (
                  <LoadingSpinner variant="inline" />
                ) : streamingUrls.appleMusic ? (
                  <a href={streamingUrls.appleMusic} target="_blank" rel="noopener noreferrer">
                    Apple Music ↗
                  </a>
                ) : (
                  'Not available on Apple Music'
                )}
                <br />
                {streamingUrls.youtube === '' ? (
                  <LoadingSpinner variant="inline" />
                ) : streamingUrls.youtube ? (
                  <a href={streamingUrls.youtube} target="_blank" rel="noopener noreferrer">
                    YouTube ↗
                  </a>
                ) : (
                  'Not available on YouTube'
                )}
                <br />
                {streamingUrls.songLink === '' ? (
                  <LoadingSpinner variant="inline" />
                ) : streamingUrls.songLink ? (
                  <a href={streamingUrls.songLink} target="_blank" rel="noopener noreferrer">
                    Songlink ↗
                  </a>
                ) : (
                  'Not available on Songlink'
                )}
              </p>
            </div>
          </div>
          {renderOpenAISummary(openAISummary)}
          {/* New recommendation section */}
          <div style={{ marginTop: '20px' }}>
            <h2>Album Recommendations</h2>
            {loadingRecommendation ? (
              <LoadingSpinner variant="recommendations" showSpinner={true} />
            ) : (
              <LazyMarkdown content={recommendation} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
