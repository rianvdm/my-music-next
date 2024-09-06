'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ArtistPage({ params }) {
    const { artist: prettyArtist } = params;
    const [artistDetails, setArtistDetails] = useState(null);
    const [topAlbums, setTopAlbums] = useState([]);
    const [openAISummary, setOpenAISummary] = useState('Loading ChatGPT summary...');
    const [error, setError] = useState(null); // State to track errors
    const router = useRouter();
    const fetchedOpenAISummary = useRef(false); // Track whether the OpenAI summary has been fetched

    // Function to convert "pretty URL" to original format
    const decodePrettyUrl = (prettyUrl) => {
        return decodeURIComponent(prettyUrl.replace(/-/g, ' '));
    };

    const artist = decodePrettyUrl(prettyArtist);

    useEffect(() => {
        if (artist) {
            async function fetchArtistData() {
                try {
                    // Fetch artist details from Last.fm
                    const artistResponse = await fetch(
                        `https://api-lastfm-artistdetail.rian-db8.workers.dev?artist=${artist}`
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
                        `https://api-lastfm-artisttopalbums.rian-db8.workers.dev?artist=${artist}`
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
                    const summaryResponse = await fetch(
                        `https://api-openai-artistdetail.rian-db8.workers.dev?name=${artist}`
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

    // Dynamic SEO and social sharing meta tags
    useEffect(() => {
        if (artistDetails) {
            // Set the document title dynamically
            document.title = `${artistDetails.name} - Artist Details`;

            // Set meta description dynamically
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', `Learn more about ${artistDetails.name} including bio, popular albums, and similar artists.`);
            } else {
                const metaTag = document.createElement('meta');
                metaTag.name = 'description';
                metaTag.content = `Learn more about ${artistDetails.name} including bio, popular albums, and similar artists.`;
                document.head.appendChild(metaTag);
            }

            // Create or update Open Graph meta tags
            const metaOGTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
            metaOGTitle.setAttribute('property', 'og:title');
            metaOGTitle.setAttribute('content', `${artistDetails.name} - Artist Details`);
            document.head.appendChild(metaOGTitle);

            const metaOGDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
            metaOGDescription.setAttribute('property', 'og:description');
            metaOGDescription.setAttribute('content', `Explore details about ${artistDetails.name}.`);
            document.head.appendChild(metaOGDescription);

            const metaOGImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
            metaOGImage.setAttribute('property', 'og:image');
            metaOGImage.setAttribute('content', artistDetails.image);
            document.head.appendChild(metaOGImage);

            const metaOGUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta');
            metaOGUrl.setAttribute('property', 'og:url');
            metaOGUrl.setAttribute('content', window.location.href);
            document.head.appendChild(metaOGUrl);

            // Create or update Twitter meta tags
            const metaTwitterTitle = document.querySelector('meta[name="twitter:title"]') || document.createElement('meta');
            metaTwitterTitle.setAttribute('name', 'twitter:title');
            metaTwitterTitle.setAttribute('content', `${artistDetails.name} - Artist Details`);
            document.head.appendChild(metaTwitterTitle);

            const metaTwitterDescription = document.querySelector('meta[name="twitter:description"]') || document.createElement('meta');
            metaTwitterDescription.setAttribute('name', 'twitter:description');
            metaTwitterDescription.setAttribute('content', `Discover more about ${artistDetails.name} including bio, albums, and similar artists.`);
            document.head.appendChild(metaTwitterDescription);

            const metaTwitterImage = document.querySelector('meta[name="twitter:image"]') || document.createElement('meta');
            metaTwitterImage.setAttribute('name', 'twitter:image');
            metaTwitterImage.setAttribute('content', artistDetails.image);
            document.head.appendChild(metaTwitterImage);

            const metaTwitterCard = document.querySelector('meta[name="twitter:card"]') || document.createElement('meta');
            metaTwitterCard.setAttribute('name', 'twitter:card');
            metaTwitterCard.setAttribute('content', 'summary');
            document.head.appendChild(metaTwitterCard);
        }
    }, [artistDetails]);

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
                                        <a href={`/album/${encodeURIComponent(artistDetails.name.replace(/ /g, '-').toLowerCase())}_${encodeURIComponent(album.name.replace(/ /g, '-').toLowerCase())}`}>
                                            {album.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p style={{ marginBottom: '0.2em' }}><strong>Similar Artists:</strong></p>
                    <ul style={{ listStyleType: 'none', paddingLeft: '0', marginTop: '0' }}>
                        {artistDetails.similar.map((similarArtist, index) => (
                            <li key={index}>
                                <Link href={`/artist/${encodeURIComponent(similarArtist.replace(/ /g, '-').toLowerCase())}`} rel="noopener noreferrer">
                                    {similarArtist}
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