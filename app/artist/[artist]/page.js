'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ArtistPage({ params }) {
    const { artist } = params;
    const [artistDetails, setArtistDetails] = useState(null);
    const [topAlbums, setTopAlbums] = useState([]);
    const [openAISummary, setOpenAISummary] = useState('Loading ChatGPT summary...');
    const [error, setError] = useState(null); // State to track errors
    const router = useRouter();
    const fetchedOpenAISummary = useRef(false); // Track whether the OpenAI summary has been fetched

    useEffect(() => {
        if (artist) {
            async function fetchArtistData() {
                try {
                    const decodedArtist = decodeURIComponent(artist);

                    // Fetch artist details from Last.fm
                    const artistResponse = await fetch(
                        `https://api-lastfm-artistdetail.rian-db8.workers.dev?artist=${encodeURIComponent(decodedArtist)}`
                    );
                    if (!artistResponse.ok) {
                        throw new Error('Artist not found');
                    }
                    let artistData = await artistResponse.json();

                    // Check if artistData is undefined or has an error property
                    if (!artistData || artistData.error) {
                        throw new Error('Artist not found');
                    }

                    // Clean up the bio text
                    if (artistData.bio) {
                        artistData.bio = artistData.bio.replace(
                            /User-contributed text is available under the Creative Commons By-SA License; additional terms may apply\./g,
                            ''
                        ).trim();
                    }

                    setArtistDetails(artistData);

                    // Fetch top albums for the artist
                    const albumsResponse = await fetch(
                        `https://api-lastfm-artisttopalbums.rian-db8.workers.dev?artist=${encodeURIComponent(decodedArtist)}`
                    );
                    const albumsData = await albumsResponse.json();

                    setTopAlbums(albumsData.topAlbums.slice(0, 3)); // Limit to top 3 albums

                    // Set the document title and meta description dynamically
                    document.title = `${artistData.name} - Artist Details`;

                    const metaDescription = document.querySelector('meta[name="description"]');
                    if (metaDescription) {
                        metaDescription.setAttribute('content', `Details about ${artistData.name}`);
                    } else {
                        const metaTag = document.createElement('meta');
                        metaTag.name = 'description';
                        metaTag.content = `Details about ${artistData.name}`;
                        document.head.appendChild(metaTag);
                    }
                } catch (error) {
                    console.error('Error fetching artist data:', error);
                    setError(error.message); // Set error state
                }
            }
            fetchArtistData();
        }
    }, [artist]);

    // Fetch OpenAI summary independently
    useEffect(() => {
        if (artist && !fetchedOpenAISummary.current) {
            fetchedOpenAISummary.current = true; // Set to true to prevent subsequent fetches

            async function fetchOpenAISummary() {
                try {
                    const decodedArtist = decodeURIComponent(artist);
                    const summaryResponse = await fetch(
                        `https://api-openai-artistdetail.rian-db8.workers.dev?name=${encodeURIComponent(decodedArtist)}`
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
    }, [artist]);

    if (error) {
        return <p>{error}</p>; // Display error message if artist not found
    }

    if (!artistDetails) {
        return <p>Loading...</p>;
    }

    const renderBioContent = (content) => {
        return content.split('\n\n').map((paragraph, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\n/g, '<br />') }} />
        ));
    };

    const renderOpenAISummary = (summary) => {
        return summary.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
        ));
    };

    // Format the user playcount with commas
    const formattedPlaycount = new Intl.NumberFormat().format(artistDetails.userplaycount);

    return (
        <div>
            <header>
                <h1>{artistDetails.name}</h1>
            </header>
            <main>
                <section className="track_ul2">
                    <div className="image-text-wrapper">
                        <img 
                            src={artistDetails.image} 
                            alt={artistDetails.name} 
                            style={{ maxWidth: '100%', width: '220px', height: 'auto' }} 
                        />
                        <div className="no-wrap-text">
                            <p><strong>My playcount:</strong> {formattedPlaycount} plays</p>
                            <p><strong>Genre:</strong> {artistDetails.tags[0] || 'No genres found'}</p>

                            <p style={{ marginBottom: '0.2em' }}><strong>Popular Albums:</strong></p>
                            <ul style={{ listStyleType: 'none', paddingLeft: '0', marginTop: '0' }}>
                                {topAlbums.map((album, index) => (
                                    <li key={index}>
                                        <a href={`/album/${artistDetails.name}_${album.name}`}>
                                            {album.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p style={{ marginBottom: '0.2em' }}><strong>Similar Artists:</strong></p>
                    <ul style={{ listStyleType: 'none', paddingLeft: '0', marginTop: '0' }}>
                        {artistDetails.similar.map((artist, index) => (
                            <li key={index}>
                                <Link href={`/artist/${encodeURIComponent(artist)}`} rel="noopener noreferrer">
                                    {artist}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <strong>Overview:</strong>
                    {renderOpenAISummary(openAISummary)}
                </section>
            </main>
        </div>
    );
}