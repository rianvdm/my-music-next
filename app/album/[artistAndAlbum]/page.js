'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import Link from 'next/link';
import { generateArtistSlug, generateAlbumSlug, generateLastfmArtistSlug } from '../../utils/slugify';

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
    const [openAISummary, setOpenAISummary] = useState('Loading summary...');
    const [artistId, setArtistId] = useState(null);
    const [error, setError] = useState(null);
    const [kvKey, setKvKey] = useState(null);  // kvKey for the follow-up worker
    const fetchedOpenAISummary = useRef(false);
    const [recommendation, setRecommendation] = useState('');
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);
    const [followUpQuestion, setFollowUpQuestion] = useState('');
    const [conversationHistory, setConversationHistory] = useState([]);
    const [followUpResponse, setFollowUpResponse] = useState('');
    const [loadingFollowUp, setLoadingFollowUp] = useState(false);

    const decodePrettyUrl = (prettyUrl) => decodeURIComponent(prettyUrl.replace(/-/g, ' '));

    const [prettyArtist, prettyAlbum] = artistAndAlbum.split('_');
    const artist = decodePrettyUrl(prettyArtist);
    const album = decodePrettyUrl(prettyAlbum);

    // Fetch album details
    useEffect(() => {
        if (artist && album) {
            async function fetchAlbumData() {
                try {
                    const spotifyQuery = `album:${album} artist:${artist}`;
                    const spotifyResponse = await fetch(
                        `https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(spotifyQuery)}&type=album`
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
                            `https://api-songlink.rian-db8.workers.dev/?url=${encodeURIComponent(spotifyAlbum.url)}`
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
                    `https://api-perplexity-albumdetail.rian-db8.workers.dev?album=${encodeURIComponent(albumName)}&artist=${encodeURIComponent(artistName)}`
                );
                const summaryData = await summaryResponse.json();
                setOpenAISummary(summaryData.data);
                setKvKey(summaryData.kvKey);  // <-- Store kvKey returned from the API
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
                    setGenres(fetchedGenres.slice(0, 2).join(', ') || 'Unknown');
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
                `https://api-openai-albumrecs.rian-db8.workers.dev/?album=${encodeURIComponent(album)}&artist=${encodeURIComponent(artist)}`
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
        return <div dangerouslySetInnerHTML={{ __html: marked(summary) }} />;
    };

    const renderFollowUpResponse = (response) => {
        return <div dangerouslySetInnerHTML={{ __html: marked(response) }} />;
    };

    if (error) {
        return (
            <p>
                {error} This either means it's not available to stream, or I am doing something wrong with the search. Please <Link href="https://github.com/rianvdm/my-music-next/issues">submit a bug report</Link> and let me know what you search for!
            </p>
        );
    }

    if (!albumDetails) {
        return <p>Loading...</p>;
    }

    const handleFollowUpQuestion = async () => {
        if (!followUpQuestion || !kvKey) return;  // <-- Ensure kvKey is present

        setLoadingFollowUp(true);

        try {
            const response = await fetch('https://api-perplexity-albumdetail-fu.rian-db8.workers.dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    kvKey,                      // <-- Send the kvKey
                    conversationHistory,         // Send the conversation history
                    userQuestion: followUpQuestion,  // Send the new follow-up question
                }),
            });

            const data = await response.json();
            setFollowUpResponse(data.data);
            
            // Append the follow-up question and response to the conversation history
            setConversationHistory([
                ...conversationHistory,
                { role: 'user', content: followUpQuestion },
                { role: 'assistant', content: data.data }
            ]);

            setFollowUpQuestion(''); // Clear the input field
        } catch (error) {
            console.error('Error sending follow-up question:', error);
        } finally {
            setLoadingFollowUp(false);
        }
    };

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
                                <strong>Released:</strong> {releaseYear}
                            </p>
                            <p>
                                <strong>Genres:</strong> {genres}
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
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <h3>Ask a follow-up question about the album</h3>
                        <input
                            type="text"
                            value={followUpQuestion}
                            onChange={(e) => setFollowUpQuestion(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFollowUpQuestion();  // Call the function when Enter is pressed
                                }
                            }}
                            placeholder="Type your follow-up question..."
                            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                        />
                        <button
                            className="button"
                            onClick={handleFollowUpQuestion}
                            disabled={loadingFollowUp || !followUpQuestion.trim()}
                            style={{ width: '100px' }}
                        >
                            {loadingFollowUp ? 'Loading...' : 'Ask'}
                        </button>
                    </div>
                    {followUpResponse && (
                        <div style={{ marginTop: '20px' }}>
                            {renderFollowUpResponse(followUpResponse)}  {/* Render follow-up response with markdown */}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}