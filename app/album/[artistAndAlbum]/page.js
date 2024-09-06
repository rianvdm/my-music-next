'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function AlbumPage({ params }) {
    const { artistAndAlbum } = params;
    const [albumDetails, setAlbumDetails] = useState(null);
    const [spotifyUrl, setSpotifyUrl] = useState('');
    const [songLinkUrl, setSongLinkUrl] = useState('');
    const [releaseYear, setReleaseYear] = useState('Loading...');
    const [trackCount, setTrackCount] = useState('Loading...');
    const [openAISummary, setOpenAISummary] = useState('Loading ChatGPT summary...');
    const [error, setError] = useState(null);
    const fetchedOpenAISummary = useRef(false);

    // Function to convert "pretty URL" to original format
    const decodePrettyUrl = (prettyUrl) => {
        return decodeURIComponent(prettyUrl.replace(/-/g, ' '));
    };

    // Split the artist and album names
    const [artist, album] = decodePrettyUrl(artistAndAlbum).split('_');

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

                    document.title = `${albumData.name} by ${artist} - Album Details`;

                    const metaDescription = document.querySelector('meta[name="description"]');
                    if (metaDescription) {
                        metaDescription.setAttribute('content', `Details about the album ${albumData.name} by ${artist}`);
                    } else {
                        const metaTag = document.createElement('meta');
                        metaTag.name = 'description';
                        metaTag.content = `Details about the album ${albumData.name} by ${artist}`;
                        document.head.appendChild(metaTag);
                    }

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
                        `https://api-openai-albumdetail.rian-db8.workers.dev?album=${album}&artist=${artist}`
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

    // Dynamic SEO and social sharing meta tags
    useEffect(() => {
        if (albumDetails) {
            // Set the document title dynamically
            document.title = `${albumDetails.name} by ${albumDetails.artist} - Album Details`;

            // Set meta description dynamically
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', `Learn more about the album ${albumDetails.name} by ${albumDetails.artist}.`);
            } else {
                const metaTag = document.createElement('meta');
                metaTag.name = 'description';
                metaTag.content = `Learn more about the album ${albumDetails.name} by ${albumDetails.artist}.`;
                document.head.appendChild(metaTag);
            }

            // Create or update Open Graph meta tags
            const metaOGTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
            metaOGTitle.setAttribute('property', 'og:title');
            metaOGTitle.setAttribute('content', `${albumDetails.name} by ${albumDetails.artist} - Album Details`);
            document.head.appendChild(metaOGTitle);

            const metaOGDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
            metaOGDescription.setAttribute('property', 'og:description');
            metaOGDescription.setAttribute('content', `Explore details about the album ${albumDetails.name} by ${albumDetails.artist}.`);
            document.head.appendChild(metaOGDescription);

            const metaOGImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
            metaOGImage.setAttribute('property', 'og:image');
            metaOGImage.setAttribute('content', albumDetails.image);
            document.head.appendChild(metaOGImage);

            const metaOGUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta');
            metaOGUrl.setAttribute('property', 'og:url');
            metaOGUrl.setAttribute('content', window.location.href);
            document.head.appendChild(metaOGUrl);

            // Create or update Twitter meta tags
            const metaTwitterTitle = document.querySelector('meta[name="twitter:title"]') || document.createElement('meta');
            metaTwitterTitle.setAttribute('name', 'twitter:title');
            metaTwitterTitle.setAttribute('content', `${albumDetails.name} by ${albumDetails.artist} - Album Details`);
            document.head.appendChild(metaTwitterTitle);

            const metaTwitterDescription = document.querySelector('meta[name="twitter:description"]') || document.createElement('meta');
            metaTwitterDescription.setAttribute('name', 'twitter:description');
            metaTwitterDescription.setAttribute('content', `Discover more about the album ${albumDetails.name} by ${albumDetails.artist}.`);
            document.head.appendChild(metaTwitterDescription);

            const metaTwitterImage = document.querySelector('meta[name="twitter:image"]') || document.createElement('meta');
            metaTwitterImage.setAttribute('name', 'twitter:image');
            metaTwitterImage.setAttribute('content', albumDetails.image);
            document.head.appendChild(metaTwitterImage);

            const metaTwitterCard = document.querySelector('meta[name="twitter:card"]') || document.createElement('meta');
            metaTwitterCard.setAttribute('name', 'twitter:card');
            metaTwitterCard.setAttribute('content', 'summary');
            document.head.appendChild(metaTwitterCard);
        }
    }, [albumDetails]);

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
        return summary.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
        ));
    };

    return (
        <div>
            <header>
                <h1>{albumDetails.name} by <a href={`/artist/${albumDetails.artist.toLowerCase()}`}>{albumDetails.artist}</a></h1>
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
                                {songLinkUrl ? <a href={songLinkUrl} target="_blank" rel="noopener noreferrer">Songlink ↗</a> : 'Loading...'}
                            </p>
                        </div>
                    </div>
                    <strong>Overview:</strong>
                    {renderOpenAISummary(openAISummary)}
                    <br /><strong>LastFM summary:</strong>
                    {albumDetails.bio ? (
                        <div style={{ marginTop: '1em' }} dangerouslySetInnerHTML={{ __html: albumDetails.bio.replace(/\n/g, '<br />') }} />
                    ) : (
                        <p>No wiki entry for this album.</p>
                    )}
                </section>
            </main>
        </div>
    );
}