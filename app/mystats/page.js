'use client';

export const runtime = 'edge';
import Head from 'next/head';
import Link from 'next/link';
import { generateArtistSlug, generateAlbumSlug, generateLastfmArtistSlug } from '../utils/slugify';
import { useEffect, useState } from 'react';

export default function Home() {
    const [topArtistsData, setTopArtistsData] = useState(null);
    const [topAlbumsData, setTopAlbumsData] = useState(null);
    const [dayGreeting, setDayGreeting] = useState('');

    useEffect(() => {

        const fetchTopArtists = async () => {
            try {
                const topArtistsResponse = await fetch('https://api-lastfm-topartists.rian-db8.workers.dev');
                const topArtistsData = await topArtistsResponse.json();

                const detailedArtistsData = await Promise.all(topArtistsData.map(async (artist) => {
                    const detailResponse = await fetch(`https://api-lastfm-artistdetail.rian-db8.workers.dev?artist=${encodeURIComponent(artist.name)}`);
                    const detailData = await detailResponse.json();
                    return {
                        name: detailData.name,
                        playcount: artist.playcount,
                        url: detailData.url,
                        image: detailData.image,
                        bio: detailData.bio,
                    };
                }));

                setTopArtistsData(detailedArtistsData);
            } catch (error) {
                console.error('Error fetching top artists data:', error);
            }
        };

        const fetchTopAlbums = async () => {
            try {
                const topAlbumsResponse = await fetch('https://api-lastfm-topalbums.rian-db8.workers.dev');
                const topAlbumsData = await topAlbumsResponse.json();
                setTopAlbumsData(topAlbumsData.slice(0, 6)); // Limit to top 6 albums
            } catch (error) {
                console.error('Error fetching top albums:', error);
            }
        };

        fetchTopArtists();
        fetchTopAlbums();
    }, []);

    const renderTopArtists = () => {
        if (!topArtistsData) {
            return <p>Loading artists...</p>;
        }

        return (
            <div className="track-grid">
                {topArtistsData.slice(0, 6).map(artist => {
                    const artistSlug = generateArtistSlug(artist.name); // If you are using a slug generator
                    return (
                        <div className="track" key={artist.name}>
                            <Link href={`artist/${artistSlug}`} rel="noopener noreferrer">
                                <img src={artist.image || '/path/to/default/image.png'} className="track_image" alt={artist.name} />
                            </Link>
                            <div className="track_content">
                                <p className="track_artist">
                                    <Link href={`artist/${artistSlug}`} rel="noopener noreferrer">
                                        {artist.name}
                                    </Link><br />
                                    <span className="track_playcount"> {artist.playcount} plays</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTopAlbums = () => {
        if (!topAlbumsData) {
            return <p>Loading albums...</p>;
        }

        return (
            <div className="track-grid">
                {topAlbumsData.map(album => {
                    const artistSlug = generateArtistSlug(album.artist);
                    const albumSlug = generateAlbumSlug(album.name);

                    return (
                        <div className="track" key={album.name}>
                            <Link href={`/album/${artistSlug}_${albumSlug}`}>
                                <img src={album.image} className="track_image" alt={album.name} />
                            </Link>
                            <div className="track_content">
                                <p className="track_name">
                                    <Link href={`/album/${artistSlug}_${albumSlug}`}>
                                        <strong>{album.name}</strong>
                                    </Link>
                                </p>
                                <p className="track_artist">
                                    <Link href={`artist/${artistSlug}`}>
                                        {album.artist}
                                    </Link><br />
                                    <span className="track_playcount"> {album.playcount} plays</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            <header>
                <h1>Real-time listening stats</h1>
            </header>
            <main>
                <section id="lastfm-stats">
                    <h2>👩‍🎤 Top Artists</h2>
                    <p style={{ textAlign: 'center' }}>
                        <strong>The top artists I listened to in the past 7 days.</strong>
                    </p>
                    {renderTopArtists()}  {/* Render top artists */}
                    <h2>🏆 Top Albums</h2>
                    <p style={{ textAlign: 'center' }}>
                        <strong>The top albums I listened to in the past 7 days.</strong>
                    </p>
                    {renderTopAlbums()}  {/* Render top albums */}
                </section>
            </main>
        </div>
    );
}