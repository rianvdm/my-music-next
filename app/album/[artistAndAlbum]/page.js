'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import Link from 'next/link';

export default function AlbumPage({ params }) {
    const { artistAndAlbum } = params;
    const [albumDetails, setAlbumDetails] = useState(null);
    const [spotifyUrl, setSpotifyUrl] = useState('');
    const [songLinkUrl, setSongLinkUrl] = useState('');
    const [appleMusicUrl, setAppleMusicUrl] = useState('');
    const [releaseYear, setReleaseYear] = useState('Loading...');
    const [trackCount, setTrackCount] = useState('Loading...');
    const [openAISummary, setOpenAISummary] = useState('Loading summary...');
    const [error, setError] = useState(null);
    const fetchedOpenAISummary = useRef(false);

    // Update the decodePrettyUrl function
    const decodePrettyUrl = (prettyUrl) => {
        return decodeURIComponent(prettyUrl.replace(/-/g, ' '));
    };

    // Split the artist and album names
    const [prettyArtist, prettyAlbum] = artistAndAlbum.split('_');
    const artist = decodePrettyUrl(prettyArtist);
    const album = decodePrettyUrl(prettyAlbum);

    useEffect(() => {
        if (artist && album) {
            async function fetchAlbumData() {
                try {
                    // Fetch album details from Last.fm
                    const albumResponse = await fetch(
                        `https://api-lastfm-albumdetail.rian-db8.workers.dev?album=${album}&artist=${artist}`
                    );
                    if (!albumResponse.ok) {
                        throw new Error('Album not found');
                    }
                    let albumData = await albumResponse.json();

                    if (!albumData || albumData.error) {
                        throw new Error('Album not found');
                    }

                    if (albumData.bio) {
                        albumData.bio = albumData.bio.replace(
                            /User-contributed text is available under the Creative Commons By-SA License; additional terms may apply\./g,
                            ''
                        ).trim();
                    }

                    setAlbumDetails(albumData);

                    // Fetch Spotify URL and additional data
                    const searchQuery = `${album} ${artist}`;
                    const spotifyResponse = await fetch(
                        `https://api-spotify-search.rian-db8.workers.dev/?q=${searchQuery}&type=album`
                    );
                    const spotifyData = await spotifyResponse.json();

                    if (spotifyData.data && spotifyData.data.length > 0) {
                        const spotifyAlbum = spotifyData.data[0];
                        setSpotifyUrl(spotifyAlbum.url);
                        
                        // Extract and set the release year
                        const releaseDate = spotifyAlbum.releaseDate;
                        if (releaseDate) {
                            setReleaseYear(releaseDate.split('-')[0]); // Only take the year part
                        }

                        // Set the track count
                        setTrackCount(spotifyAlbum.tracks || 'Unknown');

                        // Fetch SongLink URL
                        const songLinkResponse = await fetch(
                            `https://api-songlink.rian-db8.workers.dev/?url=${encodeURIComponent(spotifyAlbum.url)}`
                        );
                        const songLinkData = await songLinkResponse.json();
                        setSongLinkUrl(songLinkData.pageUrl);
                        setAppleMusicUrl(songLinkData.appleUrl);
                    }

                } catch (error) {
                    console.error('Error fetching album data:', error);
                    setError('Album not found. Please ');
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
                    //    `https://api-openai-albumdetail.rian-db8.workers.dev?album=${album}&artist=${artist}`
                        `https://api-perplexity-albumdetail.rian-db8.workers.dev?album=${album}&artist=${artist}`
                    );
                    const summaryData = await summaryResponse.json();
                    setOpenAISummary(summaryData.data);
                } catch (error) {
                    console.error('Error fetching OpenAI summary:', error);
                    setOpenAISummary('Failed to load ChatGPT summary.');
                }
            }
            fetchOpenAISummary();
        }
    }, [artist, album]);

    if (error) {
        return (
            <p>
                {error}{' '}
                <Link href="/album">
                    search again.
                </Link>
            </p>
        );
    }

    if (!albumDetails) {
        return <p>Loading...</p>;
    }

const renderOpenAISummary = (summary) => {
    // Use the `marked` library to convert the Markdown summary into HTML
    return (
        <div dangerouslySetInnerHTML={{ __html: marked(summary) }} />
    );
};

    return (
        <div>
            <header>
                <h1>{albumDetails.name} by <Link href={`/artist/${prettyArtist}`}>{albumDetails.artist}</Link></h1>
            </header>
        <main>
            <section className="track_ul2">
                <div className="image-text-wrapper">
                    <img 
                        src={albumDetails.image} 
                        alt={albumDetails.name} 
                        style={{ maxWidth: '100%', width: '220px', height: 'auto' }} 
                    />
                    <div className="no-wrap-text">
                        <p><strong>My playcount:</strong> {albumDetails.userplaycount}</p>
                        <p><strong>Genre:</strong> {(Array.isArray(albumDetails.tags) && albumDetails.tags[0]) || 'Unknown'}</p>
                        <p><strong>Released in:</strong> {releaseYear}</p>
                        <p><strong>Streaming:</strong><br /> 
                            {spotifyUrl ? <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">Spotify ↗</a> : 'Loading...'}
                            <br />
                            {appleMusicUrl === '' ? (
                                'Loading...'
                            ) : appleMusicUrl ? (
                                <a href={appleMusicUrl} target="_blank" rel="noopener noreferrer">Apple Music ↗</a>
                            ) : (
                                'Not available on Apple Music'
                            )}
                        </p>
                    </div>
                </div>
                {renderOpenAISummary(openAISummary)}
            </section>
        </main>
        </div>
    );
}