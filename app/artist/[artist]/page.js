'use client';

export const runtime = 'edge';

import Head from 'next/head';
import Link from 'next/link'; 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ArtistPage({ params }) {
    const { artist } = params;
    const [artistDetails, setArtistDetails] = useState(null);
    const [topAlbums, setTopAlbums] = useState([]);
    const router = useRouter();

useEffect(() => {
    if (artist) {
        async function fetchArtistData() {
            try {
                // Decode the artist name before making the request
                const decodedArtist = decodeURIComponent(artist);

                const artistResponse = await fetch(`https://api-lastfm-artistdetail.rian-db8.workers.dev?artist=${encodeURIComponent(decodedArtist)}`);
                let artistData = await artistResponse.json();
                console.log('Fetched Artist Data:', artistData);

                // Remove the Creative Commons text from the bio
                if (artistData.bio) {
                    artistData.bio = artistData.bio.replace(/User-contributed text is available under the Creative Commons By-SA License; additional terms may apply\./g, '').trim();
                }

                setArtistDetails(artistData);

                // Fetch top albums for the artist
                const albumsResponse = await fetch(`https://api-lastfm-artisttopalbums.rian-db8.workers.dev?artist=${encodeURIComponent(decodedArtist)}`);
                const albumsData = await albumsResponse.json();
                console.log('Fetched Albums Data:', albumsData);

                setTopAlbums(albumsData.topAlbums.slice(0, 3)); // Limit to top 3 albums
            } catch (error) {
                console.error('Error fetching artist data:', error);
            }
        }
        fetchArtistData();
    }
}, [artist]);

    if (!artistDetails) {
        return <p>Loading...</p>;
    }

    // Function to convert newline characters to paragraphs and line breaks
    const renderBioContent = (content) => {
        return content.split('\n\n').map((paragraph, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\n/g, '<br />') }} />
        ));
    };

    return (
        <div>
            <Head>
                <title>{artistDetails.name} - Artist Details</title>
                <meta name="description" content={`Details about the artist ${artistDetails.name}`} />
            </Head>
            <div className="track_ul2" style={{ paddingTop: '20px' }}>
            <Link href="#" onClick={(e) => { 
                e.preventDefault(); 
                router.back(); 
            }} style={{ color: 'var(--c-accent)', textDecoration: 'none', marginRight: '10px' }}>
                ← Back
            </Link>
                <Link href="/" style={{ color: 'var(--c-accent)', textDecoration: 'none' }}>
                    Home
                </Link>
            </div>
            <header>
                <h1 style={{ marginTop: '0.4em' }}>{artistDetails.name}</h1>
            </header>
            <main>
                <div className="track_ul2">
                    <div className="image-text-wrapper">
                        <img 
                            src={artistDetails.image} 
                            alt={artistDetails.name} 
                            style={{ maxWidth: '100%', width: '220px', height: 'auto' }} 
                        />
                        <div className="no-wrap-text">
                            <p><strong>My playcount:</strong> {artistDetails.userplaycount} tracks</p>
                            <p><strong>Genres:</strong> {artistDetails.tags.join(', ')}</p>


                            <p style={{ marginBottom: '0.2em' }}><strong>Top 3 Albums:</strong></p>
                            <ul style={{ listStyleType: 'none', paddingLeft: '0', marginTop: '0' }}>
                                {topAlbums.map((album, index) => (
                                    <li key={index}>
                                        <a href={album.url} target="_blank" rel="noopener noreferrer">
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
                <strong>Artist bio:</strong>
                </div>
                {renderBioContent(artistDetails.bio)}
            </main>
            <footer className="footer">
                <p><a href="https://youtu.be/cNtprycno14?t=9036">There’s a fire that’s been burning right outside my door.</a></p>
            </footer>
        </div>
    );
}