'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Separate components for each section
const RecommendationLink = () => (
    <p>✨ Welcome, music traveler. If you're looking for something new to listen to, you should <strong><a href="/recommendations">get rec'd</a></strong>.</p>
);

const RandomFact = ({ fact }) => (
    <p>🧠 {fact || 'Loading a random fact...'}</p>
);

const RecentTrack = ({ recentTracksData, artistSummary, isDataLoaded }) => {
    if (!isDataLoaded || !recentTracksData || !artistSummary) {
        return <p>Loading recent album and artist summary...</p>;
    }

    const artistSlug = encodeURIComponent(recentTracksData.last_artist.replace(/ /g, '-').toLowerCase());
    const albumSlug = encodeURIComponent(recentTracksData.last_album.replace(/ /g, '-').toLowerCase());

    return (
        <p>
            🎧 As for me, I recently listened to the album <Link href={`album/${artistSlug}_${albumSlug}`} rel="noopener noreferrer"><strong>{recentTracksData.last_album}</strong></Link> by <Link href={`artist/${artistSlug}`} rel="noopener noreferrer"><strong>{recentTracksData.last_artist}</strong></Link>. {artistSummary}
        </p>
    );
};

function TopAlbums({ data }) {
    if (!data) return <p>Loading albums...</p>;

    return (
        <div className="track-grid">
            {data.map(album => {
                const artistSlug = encodeURIComponent(album.artist.replace(/ /g, '-').toLowerCase());

                const formattedAlbum = album.name
                    .replace(/\s*\(.*?\)\s*/g, '')
                    .replace(/\s+/g, '-')
                    .toLowerCase();
                const albumSlug = encodeURIComponent(formattedAlbum);

                const albumUrl = `/album/${artistSlug}_${albumSlug}`;
                const artistUrl = `artist/${artistSlug}`;

                return (
                    <div className="track" key={album.name}>
                        <a href={albumUrl}>
                            <img src={album.image} className="track_image" alt={album.name} />
                        </a>
                        <div className="track_content">
                            <p className="track_name">
                                <a href={albumUrl}><strong>{album.name}</strong></a>
                            </p>
                            <p className="track_artist">
                                <Link href={artistUrl} rel="noopener noreferrer">
                                    {album.artist}
                                </Link>
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Extracted album search functionality
const AlbumSearch = () => {
    const [album, setAlbum] = useState('');
    const [artist, setArtist] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSearch = async () => {
        if (album.trim() === '' || artist.trim() === '') {
            setError('Please enter both album and artist names.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const query = `album: "${album}" artist:"${artist}"`;
            const spotifyResponse = await fetch(
                `https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(query)}&type=album`
            );
            const spotifyData = await spotifyResponse.json();

            if (spotifyData.data && spotifyData.data.length > 0) {
                const spotifyAlbum = spotifyData.data[0];
                const formattedArtist = encodeURIComponent(spotifyAlbum.artist.replace(/ /g, '-').toLowerCase());
                const formattedAlbum = spotifyAlbum.name
                    .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .toLowerCase();

                router.push(`/album/${formattedArtist}_${formattedAlbum}`);
            } else {
                setError('No album found for the given artist and album.');
            }
        } catch (error) {
            console.error('Error fetching from Spotify:', error);
            setError('An error occurred while fetching album data.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div id="search-form">
            <input
                id="album-name"
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter album name..."
            />
            <input
                id="artist-name"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter artist name..."
            />
            <button className="button" onClick={handleSearch} disabled={loading} style={{ width: '100px' }}>
                {loading ? 'Searching...' : 'Search'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default function Home() {
    const [recentTracksData, setRecentTracksData] = useState(null);
    const [artistSummary, setArtistSummary] = useState(null);
    const [topAlbumsData, setTopAlbumsData] = useState(null);
    const [dayGreeting, setDayGreeting] = useState('');
    const [randomFact, setRandomFact] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const fetchedRandomFact = useRef(false);

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

        const fetchRecentTracksFromKV = async () => {
            try {
                const response = await fetch('https://kv-fetch-last-track.rian-db8.workers.dev/');
                const recentTracksData = await response.json();
                setRecentTracksData(recentTracksData);

                if (recentTracksData.last_artist) {
                    fetchArtistSummary(recentTracksData.last_artist);
                }
            } catch (error) {
                console.error('Error fetching recent tracks from KV:', error);
            }
        };

        const fetchArtistSummary = async (artistName) => {
            try {
                const summaryResponse = await fetch(`https://api-openai-artistsentence.rian-db8.workers.dev?name=${artistName}`);
                const summaryData = await summaryResponse.json();
                setArtistSummary(summaryData.data);
                setIsDataLoaded(true);
            } catch (error) {
                console.error(`Error fetching summary for ${artistName}:`, error);
                setArtistSummary('Failed to load artist summary.');
            }
        };

        setGreeting();
        fetchRecentTracksFromKV();
        fetchRandomFact();
    }, []);

    useEffect(() => {
        // Fetch the top albums from KV instead of Last.fm API
        const fetchTopAlbumsFromKV = async () => {
            try {
                const response = await fetch('https://kv-fetch-top-albums.rian-db8.workers.dev/');
                const topAlbumsData = await response.json();
                setTopAlbumsData(topAlbumsData);
            } catch (error) {
                console.error('Error fetching top albums from KV:', error);
            }
        };

        fetchTopAlbumsFromKV();
    }, []);

    return (
        <div>
            <header>
                <h1>{dayGreeting}</h1>
            </header>
            <main>
                <section id="lastfm-stats">
                    <RecommendationLink />
                <RandomFact fact={randomFact} />
                {isDataLoaded ? (
                    <RecentTrack 
                        recentTracksData={recentTracksData} 
                        artistSummary={artistSummary} 
                        isDataLoaded={isDataLoaded} 
                    />
                ) : (
                    <p>Loading recent album and artist summary...</p>
                )}
                    <h2 style={{ marginBottom: 0, marginTop: "2em" }}>💿 Go ahead, search for something you like</h2>
                    <AlbumSearch /> {/* Album search functionality goes here */}


                    <h2>🏆 Or give some of these a try</h2>
                    <p style={{ textAlign: 'center' }}>
                        These are the top albums I listened to in the past 7 days.
                    </p>
                    <Suspense fallback={<p>Loading albums...</p>}>
                        <TopAlbums data={topAlbumsData} />
                    </Suspense>
                </section>
            </main>
        </div>
    );
}