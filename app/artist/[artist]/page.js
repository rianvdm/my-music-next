'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import Link from 'next/link';
import { generateArtistSlug, generateAlbumSlug, generateLastfmArtistSlug, generateGenreSlug } from '../../utils/slugify';

export default function ArtistPage({ params }) {
    const { artist: prettyArtist } = params;
    const [artistDetails, setArtistDetails] = useState(null);
    const [topAlbums, setTopAlbums] = useState([]);
    const [openAISummary, setOpenAISummary] = useState('Loading summary...');
    const [error, setError] = useState(null);
    const fetchedOpenAISummary = useRef(false);

    const decodePrettyUrl = (prettyUrl) => {
        return decodeURIComponent(prettyUrl.replace(/-/g, ' '))
    };

    const artist = decodePrettyUrl(prettyArtist);

    useEffect(() => {
        if (artist) {
            async function fetchArtistData() {
                try {
                    const encodedArtist = encodeURIComponent(artist);

                    const artistResponse = await fetch(
                        `https://api-lastfm-artistdetail.rian-db8.workers.dev?artist=${encodedArtist}`
                    );
                    if (!artistResponse.ok) {
                        throw new Error('Artist not found');
                    }
                    let artistData = await artistResponse.json();

                    if (!artistData || artistData.error) {
                        throw new Error('Artist not found');
                    }

                    if (artistData.bio) {
                        artistData.bio = artistData.bio.replace(
                            /User-contributed text is available under the Creative Commons By-SA License; additional terms may apply\./g,
                            ''
                        ).trim();
                    }

                    setArtistDetails(artistData);

                    const albumsResponse = await fetch(
                        `https://api-lastfm-artisttopalbums.rian-db8.workers.dev?artist=${artist}`
                    );
                    const albumsData = await albumsResponse.json();

                    setTopAlbums(albumsData.topAlbums?.slice(0, 3) || []);

                } catch (error) {
                    console.error('Error fetching artist data:', error);
                    setError(error.message);
                }
            }
            fetchArtistData();
        }
    }, [artist]);

    // Fetch OpenAI summary independently
    useEffect(() => {
        if (artistDetails?.name && !fetchedOpenAISummary.current) {
            fetchedOpenAISummary.current = true;

            async function fetchOpenAISummary() {
                try {
                    const encodedArtistName = encodeURIComponent(artistDetails.name);

                    const summaryResponse = await fetch(
                        `https://api-openai-artistdetail.rian-db8.workers.dev?name=${encodedArtistName}`
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
    }, [artistDetails]);

    if (error) {
        return <p>{error}</p>;
    }

    if (!artistDetails) {
        return <p>Loading...</p>;
    }

    const renderOpenAISummary = (summary) => {
        return <div dangerouslySetInnerHTML={{ __html: marked(summary) }} />;
    };

    const formattedPlaycount = new Intl.NumberFormat().format(artistDetails.userplaycount);

    // Use the fallback image if artistDetails.image is an empty string
    const artistImage = artistDetails.image || 'https://file.elezea.com/noun-no-image.png';

    const formattedArtist = generateArtistSlug(artistDetails.name);

    const genre = artistDetails.tags[0] || 'No genres found';
    const genreSlug = genre !== 'No genres found' ? generateGenreSlug(genre) : '';

    return (
        <div>
            <header>
                <h1>{artistDetails.name}</h1>
            </header>
            <main>
                <section className="track_ul2">
                    <div className="image-text-wrapper">
                        <img 
                            src={artistImage} 
                            alt={artistDetails.name} 
                            style={{ maxWidth: '100%', width: '220px', height: 'auto' }} 
                        />
                        <div className="no-wrap-text">
                            <p>
                                <strong>Genre:</strong>{' '}
                                {genre !== 'No genres found' ? (
                                    <Link href={`/genre/${genreSlug}`}>
                                        {genre}
                                    </Link>
                                ) : (
                                    genre
                                )}
                            </p>

                            <p style={{ marginBottom: '0.2em' }}><strong>Popular Albums:</strong></p>
                            <ul style={{ listStyleType: 'none', paddingLeft: '0', marginTop: '0', marginBottom: '0' }}>
                                {topAlbums.length > 0 ? (
                                    topAlbums.map((album, index) => {
                                        const formattedAlbum = generateAlbumSlug(album.name);
                                        return (
                                            <li key={index}>
                                                <a href={`/album/${formattedArtist}_${formattedAlbum}`}>
                                                    {album.name}
                                                </a>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li>No albums found</li>
                                )}
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