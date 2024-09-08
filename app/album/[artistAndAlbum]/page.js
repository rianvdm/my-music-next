'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import Link from 'next/link';

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
    const [openAISummary, setOpenAISummary] = useState('Loading summary...');
    const [error, setError] = useState(null);
    const fetchedOpenAISummary = useRef(false);
    const [recommendation, setRecommendation] = useState('');
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);

    const decodePrettyUrl = (prettyUrl) => {
        return decodeURIComponent(prettyUrl.replace(/-/g, ' '));
    };

    const [prettyArtist, prettyAlbum] = artistAndAlbum.split('_');
    const artist = decodePrettyUrl(prettyArtist);
    const album = decodePrettyUrl(prettyAlbum);

    useEffect(() => {
        if (artist && album) {
            async function fetchAlbumData() {
                try {
                    const albumResponse = await fetch(
                        `https://api-lastfm-albumdetail.rian-db8.workers.dev?album=${album}&artist=${artist}`
                    );
                    if (!albumResponse.ok) throw new Error('Album not found');
                    const albumData = await albumResponse.json();
                    if (!albumData || albumData.error) throw new Error('Album not found');
                    setAlbumDetails(albumData);

                    const searchQuery = `${album} ${artist}`;
                    const spotifyResponse = await fetch(
                        `https://api-spotify-search.rian-db8.workers.dev/?q=${searchQuery}&type=album`
                    );
                    const spotifyData = await spotifyResponse.json();
                    if (spotifyData.data && spotifyData.data.length > 0) {
                        const spotifyAlbum = spotifyData.data[0];
                        setStreamingUrls((prevUrls) => ({
                            ...prevUrls,
                            spotify: spotifyAlbum.url,
                        }));

                        const releaseDate = spotifyAlbum.releaseDate;
                        if (releaseDate) setReleaseYear(releaseDate.split('-')[0]);
                        setTrackCount(spotifyAlbum.tracks || 'Unknown');

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
                    }
                } catch (error) {
                    console.error('Error fetching album data:', error);
                    setError('Album not found.');
                }
            }
            fetchAlbumData();
        }
    }, [artist, album]);

    useEffect(() => {
        if (artist && album && !fetchedOpenAISummary.current) {
            fetchedOpenAISummary.current = true;
            async function fetchOpenAISummary() {
                try {
                    const summaryResponse = await fetch(
                        `https://api-perplexity-albumdetail.rian-db8.workers.dev?album=${album}&artist=${artist}`
                    );
                    const summaryData = await summaryResponse.json();
                    setOpenAISummary(summaryData.data);
                } catch (error) {
                    console.error('Error fetching OpenAI summary:', error);
                    setOpenAISummary('Failed to load summary.');
                }
            }
            fetchOpenAISummary();
        }
    }, [artist, album]);

    const renderOpenAISummary = (summary) => {
        return <div dangerouslySetInnerHTML={{ __html: marked(summary) }} />;
    };

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

    if (error) {
        return (
            <p>{error} <Link href="/album">search again.</Link></p>
        );
    }

    if (!albumDetails) {
        return <p>Loading...</p>;
    }

    // Use the fallback image if albumDetails.image is an empty string
    const albumImage = albumDetails.image || 'https://file.elezea.com/noun-no-image.png';

    return (
        <div>
            <header>
                <h1>{albumDetails.name} by <Link href={`/artist/${prettyArtist}`}>{albumDetails.artist}</Link></h1>
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
                            {/*<p><strong>Genre:</strong> {(Array.isArray(albumDetails.tags) && albumDetails.tags[0]) || 'Unknown'}</p>*/}
                            <p><strong>Released:</strong> {releaseYear}</p>
                            <p><strong>Streaming:</strong><br /> 
                                {streamingUrls.spotify ? <a href={streamingUrls.spotify} target="_blank" rel="noopener noreferrer">Spotify ↗</a> : 'Loading...'}
                                <br />
                                {streamingUrls.appleMusic === '' ? (
                                    'Loading...'
                                ) : streamingUrls.appleMusic ? (
                                    <a href={streamingUrls.appleMusic} target="_blank" rel="noopener noreferrer">Apple Music ↗</a>
                                ) : (
                                    'Not available on Apple Music'
                                )}
                                <br />
                                {streamingUrls.youtube === '' ? (
                                    'Loading...'
                                ) : streamingUrls.youtube ? (
                                    <a href={streamingUrls.youtube} target="_blank" rel="noopener noreferrer">YouTube ↗</a>
                                ) : (
                                    'Not available on YouTube'
                                )}
                            </p>
                        </div>
                    </div>
                    {renderOpenAISummary(openAISummary)}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <h3>Want a recommendation for similar albums to check out?</h3> 
                        <button className="button" onClick={handleRecommendation} disabled={loadingRecommendation}>
                            {loadingRecommendation ? 'Loading...' : 'Get rec’d'}
                        </button>
                    </div>
                    {recommendation && (
                        <div style={{ marginTop: '20px' }} dangerouslySetInnerHTML={{ __html: recommendation }} />
                    )}
                </section>
            </main>
        </div>
    );
}