'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
    const [recentTracksData, setRecentTracksData] = useState(null);
    const [topArtistsData, setTopArtistsData] = useState(null);
    const [topAlbumsData, setTopAlbumsData] = useState(null);
    const [dayGreeting, setDayGreeting] = useState('');
    const [artistSummary, setArtistSummary] = useState(''); // State for the last artist summary

    useEffect(() => {
        const setGreeting = () => {
            const options = { weekday: 'long' };
            const today = new Date();
            const dayName = new Intl.DateTimeFormat('en-US', options).format(today);
            setDayGreeting(`Happy ${dayName}, friend!`);
        };

        setGreeting();

        const fetchRecentTracks = async () => {
            try {
                console.time('fetchRecentTracks');
                const recentTracksResponse = await fetch('https://api-lastfm-recenttracks.rian-db8.workers.dev');
                const recentTracksData = await recentTracksResponse.json();
                console.timeEnd('fetchRecentTracks');
                setRecentTracksData(recentTracksData);

                // Fetch the artist summary for the last artist
                if (recentTracksData.last_artist) {
                    fetchArtistSummary(recentTracksData.last_artist);
                }
            } catch (error) {
                console.error('Error fetching recent tracks data:', error);
            }
        };

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

        const fetchArtistSummary = async (artistName) => {
            try {
                const summaryResponse = await fetch(`https://api-openai-artistsentence.rian-db8.workers.dev?name=${encodeURIComponent(artistName)}`);
                const summaryData = await summaryResponse.json();
                setArtistSummary(summaryData.data);
            } catch (error) {
                console.error(`Error fetching summary for ${artistName}:`, error);
                setArtistSummary('Failed to load artist summary.');
            }
        };

        fetchRecentTracks();
        fetchTopArtists();
        fetchTopAlbums();
    }, []);

    const renderRecentTracks = () => {
        if (!recentTracksData) {
            return <p>Loading recent stats...</p>;
        }

        return (
            <p>
                Over the last 7 days I listened to <strong>{new Intl.NumberFormat().format(recentTracksData.playcount)} tracks</strong> across <strong>{new Intl.NumberFormat().format(recentTracksData.artist_count)} artists</strong> and <strong>{new Intl.NumberFormat().format(recentTracksData.album_count)} albums</strong>. The last artist I listened to was <Link href={`artist/${encodeURIComponent(recentTracksData.last_artist)}`} rel="noopener noreferrer"><strong>{recentTracksData.last_artist}</strong></Link>. {artistSummary}
            </p>
        );
    };

    const renderTopArtists = () => {
        if (!topArtistsData) {
            return <p>Loading artists...</p>;
        }

        return (
            <div className="track-grid">
                {topArtistsData.slice(0, 6).map(artist => (
                    <div className="track" key={artist.name}>
                        <Link href={`artist/${encodeURIComponent(artist.name)}`} rel="noopener noreferrer">
                            <img src={artist.image || '/path/to/default/image.png'} className="track_image" alt={artist.name} />
                        </Link>
                        <div className="track_content">
                            <h2 className="track_artist">
                                <Link href={`artist/${encodeURIComponent(artist.name)}`} rel="noopener noreferrer">
                                    {artist.name}
                                </Link>
                            </h2>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTopAlbums = () => {
        if (!topAlbumsData) {
            return <p>Loading albums...</p>;
        }

        return (
            <div className="track-grid">
                {topAlbumsData.map(album => (
                    <div className="track" key={album.name}>
                        <a href={album.albumUrl} target="_blank" rel="noopener noreferrer">
                            <img src={album.image} className="track_image" alt={album.name} />
                        </a>
                        <div className="track_content">
                            <p className="track_name"><strong>{album.name}</strong></p>
                            <p className="track_artist">
                                <Link href={`artist/${encodeURIComponent(album.artist)}`} rel="noopener noreferrer">
                                    {album.artist}
                                </Link></p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <header>
                <h1>{dayGreeting}</h1>
            </header>
            <main>
                <section id="lastfm-stats">
                    {renderRecentTracks()}``
                    <h2 style={{ marginTop: '0.3em' }}>👩‍🎤 Top Artists</h2>
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
            <div className="footer">
                <p><a href="https://youtu.be/cNtprycno14?t=9036">There’s a fire that’s been burning right outside my door.</a></p>
            </div>
        </div>
    );
}