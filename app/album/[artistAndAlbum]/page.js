'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
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
  const [openAISummary, setOpenAISummary] = useState('Generating summary...');
  const [showExtendedMessage, setShowExtendedMessage] = useState(false); // New state for extended message
  const [artistId, setArtistId] = useState(null);
  const [error, setError] = useState(null);
  const [kvKey, setKvKey] = useState(null); // kvKey for the follow-up worker
  const fetchedOpenAISummary = useRef(false);
  const timerRef = useRef(null); // Timer reference for the extended message
  const [recommendation, setRecommendation] = useState('');
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [followUpResponse, setFollowUpResponse] = useState('');
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0); // <-- Track number of follow-up questions

  const decodePrettyUrl = (prettyUrl) =>
    decodeURIComponent(prettyUrl.replace(/-/g, ' '));

  const [prettyArtist, prettyAlbum] = artistAndAlbum.split('_');
  const artist = decodePrettyUrl(prettyArtist);
  const album = decodePrettyUrl(prettyAlbum);

  // Timer effect for showing extended message after 3 seconds
  useEffect(() => {
    if (openAISummary === 'Generating summary...') {
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

            setStreamingUrls((prevUrls) => ({
              ...prevUrls,
              spotify: spotifyAlbum.url,
            }));

            const releaseDate = spotifyAlbum.releaseDate;
            if (releaseDate) setReleaseYear(releaseDate.split('-')[0]);
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
            setStreamingUrls((prevUrls) => ({
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
        setOpenAISummary(summaryData.data);
        setKvKey(summaryData.kvKey); // <-- Store kvKey returned from the API
      } catch (error) {
        console.error('Error fetching OpenAI summary:', error);
        setOpenAISummary('Failed to load summary.');
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

  // Fetch recommendations
  const handleRecommendation = async () => {
    setLoadingRecommendation(true);
    try {
      const response = await fetch(
        `https://api-perplexity-albumrecs.rian-db8.workers.dev/?album=${encodeURIComponent(
          album
        )}&artist=${encodeURIComponent(artist)}`
      );
      const data = await response.json();
      setRecommendation(marked(data.data));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendation('Failed to load recommendations.');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const renderOpenAISummary = (summary) => {
    if (summary === 'Generating summary...') {
      return (
        <div>
          {summary}
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
    return <div dangerouslySetInnerHTML={{ __html: marked(summary) }} />;
  };

  const renderFollowUpResponse = (response) => {
    return <div dangerouslySetInnerHTML={{ __html: marked(response) }} />;
  };

  if (error) {
    return (
      <p>
        {error} This either means it's not available to stream, or I am doing
        something wrong with the search. Please{' '}
        <Link href="https://github.com/rianvdm/my-music-next/issues">
          submit a bug report
        </Link>{' '}
        and let me know what you searched for! <br />
        <br />
        You can also <a href="/album">try the search manually</a> and see if
        that works.
      </p>
    );
  }

  if (!albumDetails) {
    return <p>Loading...</p>;
  }

  const handleFollowUpQuestion = async () => {
    if (
      !followUpQuestion ||
      !artist ||
      !album ||
      followUpCount >= 3
    )
      return; // Limit to 3 follow-up questions

    setLoadingFollowUp(true);

    try {
      const response = await fetch(
        'https://api-perplexity-albumdetail-fu.rian-db8.workers.dev',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kvKey, // Keep the kvKey
            artistName: artist, // Send the artist name
            albumName: album, // Send the album name
            conversationHistory, // Send the conversation history
            userQuestion: followUpQuestion, // Send the new follow-up question
          }),
        }
      );

      const data = await response.json();
      setFollowUpResponse(data.data);

      // Append the follow-up question and response to the conversation history
      setConversationHistory([
        ...conversationHistory,
        { role: 'user', content: followUpQuestion },
        { role: 'assistant', content: data.data },
      ]);

      setFollowUpQuestion(''); // Clear the input field
      setFollowUpCount(followUpCount + 1); // Increment follow-up count
    } catch (error) {
      console.error('Error sending follow-up question:', error);
    } finally {
      setLoadingFollowUp(false);
    }
  };

  const prettySpotifyArtist = generateLastfmArtistSlug(albumDetails.artist);
  const albumImage =
    albumDetails.image || 'https://file.elezea.com/noun-no-image.png';

  return (
    <div>
      <header>
        <h1>
          {albumDetails.name} by{' '}
          <Link href={`/artist/${prettySpotifyArtist}`}>
            {albumDetails.artist}
          </Link>
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
                <strong>Released:</strong> {releaseYear}
              </p>
              <p>
                <strong>Genres:</strong>{' '}
                {genres !== 'Unknown' ? (
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
                  <a
                    href={streamingUrls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Spotify ↗
                  </a>
                ) : (
                  'Loading...'
                )}
                <br />
                {streamingUrls.appleMusic === '' ? (
                  'Loading...'
                ) : streamingUrls.appleMusic ? (
                  <a
                    href={streamingUrls.appleMusic}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apple Music ↗
                  </a>
                ) : (
                  'Not available on Apple Music'
                )}
                <br />
                {streamingUrls.youtube === '' ? (
                  'Loading...'
                ) : streamingUrls.youtube ? (
                  <a
                    href={streamingUrls.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    YouTube ↗
                  </a>
                ) : (
                  'Not available on YouTube'
                )}
                <br />
                {streamingUrls.songLink === '' ? (
                  'Loading...'
                ) : streamingUrls.songLink ? (
                  <a
                    href={streamingUrls.songLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Songlink ↗
                  </a>
                ) : (
                  'Not available on Songlink'
                )}
              </p>
            </div>
          </div>
          {renderOpenAISummary(openAISummary)}
          {/* Commenting out the follow-up question section */}
          {/*
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2 style={{ marginBottom: 0 }}>Ask a follow-up question about the album</h2>
            <div id="search-form">
              <input
                id="follow-up-search"
                type="text"
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFollowUpQuestion();  // Call the function when Enter is pressed
                  }
                }}
                placeholder={
                  followUpCount < 3
                    ? 'Type your follow-up question...'
                    : 'No more follow-up questions allowed'
                } // Show message when limit is reached
                disabled={followUpCount >= 3} // Disable input if follow-up limit is reached
              />
              <button
                className="button"
                onClick={handleFollowUpQuestion}
                style={{ width: '100px' }}
                disabled={
                  loadingFollowUp ||
                  !followUpQuestion.trim() ||
                  followUpCount >= 3
                } // Disable button if follow-up limit is reached
              >
                {loadingFollowUp ? 'Loading...' : 'Ask'}
              </button>
            </div>
          </div>
          {followUpResponse && (
            <div style={{ marginTop: '20px' }}>
              <p>
                <strong>
                  Q:{' '}
                  {
                    conversationHistory[
                      conversationHistory.length - 2
                    ]?.content
                  }
                </strong>
              </p>
              {renderFollowUpResponse(followUpResponse)}{' '}
            </div>
          )}
          */}
          {/* New recommendation section */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>
              Need some inspiration?
            </h2>
            <p>Click below to let the robots recommend some similar albums to you that are hopefully a little off the beaten path.</p>
            <button
              className="button"
              onClick={handleRecommendation}
              style={{ width: '100px' }}
              disabled={loadingRecommendation}
            >
              {loadingRecommendation ? 'Loading...' : "Get rec'd"}
            </button>
          </div>
          {recommendation && (
            <div style={{ marginTop: '20px' }}>
              <div dangerouslySetInnerHTML={{ __html: recommendation }} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}