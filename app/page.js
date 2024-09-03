'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';

function TopArtists({ data }) {
    if (!data) return <p>Loading artists...</p>;

    return (
        <div className="track-grid">
            {data.map(artist => (
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
}

function TopAlbums({ data }) {
    if (!data) return <p>Loading albums...</p>;

    return (
        <div className="track-grid">
            {data.map(album => (
                <div className="track" key={album.name}>
                    <a href={`/album/${encodeURIComponent(album.artist)}_${encodeURIComponent(album.name)}`}>
                        <img src={album.image} className="track_image" alt={album.name} />
                    </a>
                    <div className="track_content">
                        <p className="track_name"><a href={`/album/${encodeURIComponent(album.artist)}_${encodeURIComponent(album.name)}`}><strong>{album.name}</strong></a></p>
                        <p className="track_artist">
                            <Link href={`artist/${encodeURIComponent(album.artist)}`} rel="noopener noreferrer">
                                {album.artist}
                            </Link></p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Home() {
    const [recentTracksData, setRecentTracksData] = useState(null);
    const [topArtistsData, setTopArtistsData] = useState(null);
    const [topAlbumsData, setTopAlbumsData] = useState(null);
    const [dayGreeting, setDayGreeting] = useState('');
    const [artistSummary, setArtistSummary] = useState('');
    const [randomFact, setRandomFact] = useState('');

    const fetchedRandomFact = useRef(false); // Ensure the fact is fetched only once

    useEffect(() => {
        const setGreeting = () => {
            const options = { weekday: 'long' };
            const today = new Date();
            const dayName = new Intl.DateTimeFormat('en-US', options).format(today);
            setDayGreeting(`Happy ${dayName}, friend!`);
        };

        const fetchRandomFact = async () => {
            if (fetchedRandomFact.current) return;
            fetchedRandomFact.current = true;

            try {
                const response = await fetch('https://kv-fetch-random-fact.rian-db8.workers.dev/');
                const factData = await response.json();
                setRandomFact(factData.data);
            } catch (error) {
                console.error('Error fetching random fact:', error);
                setRandomFact('Did you know? There was an error loading a random fact.');
            }
        };

        const fetchRecentTracks = async () => {
            try {
                const recentTracksResponse = await fetch('https://api-lastfm-recenttracks.rian-db8.workers.dev');
                const recentTracksData = await recentTracksResponse.json();
                setRecentTracksData(recentTracksData);

                if (recentTracksData.last_artist) {
                    fetchArtistSummary(recentTracksData.last_artist);
                }
            } catch (error) {
                console.error('Error fetching recent tracks data:', error);
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

        setGreeting();
        fetchRandomFact(); // Fetch and display random fact early
        fetchRecentTracks(); // Fetch recent tracks and artist summary
    }, []); // Empty dependency array ensures this runs only once when the component mounts

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
                setTopAlbumsData(topAlbumsData);
            } catch (error) {
                console.error('Error fetching top albums:', error);
            }
        };

        fetchTopArtists();
        fetchTopAlbums();
    }, []); // Separate useEffect for non-critical data

    const renderRecentTracks = () => {
        if (!recentTracksData) {
            return <p>Loading...</p>;
        }

        return (
            <>
                <p>
                    🎧 Most recently I listened to <Link href={`album/${encodeURIComponent(recentTracksData.last_artist)}_${encodeURIComponent(recentTracksData.last_album)}`} rel="noopener noreferrer"><strong>{recentTracksData.last_album}</strong></Link> by <Link href={`artist/${encodeURIComponent(recentTracksData.last_artist)}`} rel="noopener noreferrer"><strong>{recentTracksData.last_artist}</strong></Link>. {artistSummary}
                </p>
                <p>🧠 {randomFact}</p>
                <p>
                    ✨ If you're looking for something new to listen to, you should <strong><a href="/recommendations">get rec’d</a></strong>.
                </p>
            </>
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
                    <h2>👩‍🎤 Top Artists</h2>
                    <p style={{ textAlign: 'center' }}>
                        <strong>The top artists I listened to in the past 7 days.</strong>
                    </p>
                    <Suspense fallback={<p>Loading artists...</p>}>
                        <TopArtists data={topArtistsData} />
                    </Suspense>
                    <h2>🏆 Top Albums</h2>
                    <p style={{ textAlign: 'center' }}>
                        <strong>The top albums I listened to in the past 7 days.</strong>
                    </p>
                    <Suspense fallback={<p>Loading albums...</p>}>
                        <TopAlbums data={topAlbumsData} />
                    </Suspense>
                </section>
            </main>
        </div>
    );
}