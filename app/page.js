'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
    const [recentTracksData, setRecentTracksData] = useState(null);
    const [topArtistsData, setTopArtistsData] = useState(null);
    const [topAlbumsData, setTopAlbumsData] = useState(null);
    const [dayGreeting, setDayGreeting] = useState('');

    useEffect(() => {
        // Set the greeting based on the current day in the user's time zone
        const setGreeting = () => {
            const options = { weekday: 'long' };
            const today = new Date();
            const dayName = new Intl.DateTimeFormat('en-US', options).format(today);
            setDayGreeting(`Happy ${dayName}, friend!`);
        };

        setGreeting();

        // Fetch recent tracks separately to ensure it can render as soon as it's ready
        const fetchRecentTracks = async () => {
            try {
                console.time('fetchRecentTracks');
                const recentTracksResponse = await fetch('https://api-lastfm-recenttracks.rian-db8.workers.dev');
                const recentTracksData = await recentTracksResponse.json();
                console.timeEnd('fetchRecentTracks');
                setRecentTracksData(recentTracksData);
            } catch (error) {
                console.error('Error fetching recent tracks data:', error);
            }
        };

        const fetchTopArtists = async () => {
            try {
                const topArtistsResponse = await fetch('https://api-lastfm-topartists.rian-db8.workers.dev');
                const topArtistsData = await topArtistsResponse.json();

                // Fetch artist details for each artist to get the image and other details
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

        fetchRecentTracks();
        fetchTopArtists();
        fetchTopAlbums();
    }, []);

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
                            <p className="track_name">{artist.playcount} plays</p>
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
                            <p className="track_album">{album.playcount} songs played</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderRecentTracks = () => {
        if (!recentTracksData) {
            return <p>Loading recent stats...</p>;
        }

        return (
            <p>
                Over the last 7 days I listened to <strong>{new Intl.NumberFormat().format(recentTracksData.playcount)} tracks</strong> across <strong>{new Intl.NumberFormat().format(recentTracksData.artist_count)} artists</strong> and <strong>{new Intl.NumberFormat().format(recentTracksData.album_count)} albums</strong>. The last artist I listened to was <Link href={`artist/${encodeURIComponent(recentTracksData.last_artist)}`} rel="noopener noreferrer"><strong>{recentTracksData.last_artist}</strong></Link>.
            </p>
        );
    };

    return (
        <div>
            <header>
                <h1>{dayGreeting}</h1>
            </header>
            <main>
                <section id="lastfm-stats">
                    {renderRecentTracks()}
                    <p style={{ textAlign: 'center' }}>
                      🚧 <em>I am slowly porting <a href="https://music.elezea.com">the old music site</a> over to Cloudflare <a href="https://pages.cloudflare.com/">Pages</a> and <a href="https://workers.cloudflare.com/">Workers</a>. Things might be a bit messy for a while.</em> 🚧
                    </p>
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
            <div className="footer">
                <p><a href="https://youtu.be/cNtprycno14?t=9036">There’s a fire that’s been burning right outside my door.</a></p>
            </div>
        </div>
    );
}