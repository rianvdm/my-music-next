'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateArtistSlug, generateAlbumSlug, generateLastfmArtistSlug } from './/utils/slugify'; 

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

    const artistSlug = generateArtistSlug(recentTracksData.last_artist);
    const artistLastfmSlug = generateLastfmArtistSlug(recentTracksData.last_artist);
    const albumSlug = generateAlbumSlug(recentTracksData.last_album);

    return (
        <p>
            🎧 I recently listened to <Link href={`album/${artistSlug}_${albumSlug}`} rel="noopener noreferrer"><strong>{recentTracksData.last_album}</strong></Link> by <Link href={`artist/${artistLastfmSlug}`} rel="noopener noreferrer"><strong>{recentTracksData.last_artist}</strong></Link>. {artistSummary}
        </p>
    );
};

// Display recent searches
function RecentSearches({ data }) {
    if (!data) return <p>Loading recent searches...</p>;

    return (
        <div className="track-grid">
            {data.map(album => {
                const artistSlug = generateArtistSlug(album.artist);
                const albumSlug = generateAlbumSlug(album.name);

                const albumUrl = `/album/${artistSlug}_${albumSlug}`;
                const artistUrl = `artist/${artistSlug}`;

                return (
                    <div className="track" key={album.id}>
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
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSearch = () => {
        if (album.trim() === '' || artist.trim() === '') {
            setError('Please enter both album and artist names.');
            return;
        }

        // Generate the slugs from the user input
        const formattedArtist = generateArtistSlug(artist);
        const formattedAlbum = generateAlbumSlug(album);

        // Navigate to the album page where the search will happen
        router.push(`/album/${formattedArtist}_${formattedAlbum}`);
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
            <button className="button" onClick={handleSearch} style={{ width: '100px' }}>
                Search
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default function Home() {
    const [recentTracksData, setRecentTracksData] = useState(null);
    const [artistSummary, setArtistSummary] = useState(null);
    const [recentSearchesData, setRecentSearchesData] = useState(null);
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
                const encodedArtistName = encodeURIComponent(artistName);
                const summaryResponse = await fetch(`https://api-openai-artistsentence.rian-db8.workers.dev?name=${encodedArtistName}`);
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
        // Fetch the recent searches from KV
        const fetchRecentSearchesFromKV = async () => {
            try {
                const response = await fetch('https://kv-fetch-recentsearches.rian-db8.workers.dev/');
                const recentSearchesData = await response.json();
                setRecentSearchesData(recentSearchesData.data); // Access the 'data' property
            } catch (error) {
                console.error('Error fetching recent searches from KV:', error);
            }
        };

        fetchRecentSearchesFromKV();
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
                    <h2 style={{ marginBottom: 0, marginTop: "2em" }}>💿 Learn more about an album</h2>
                    <AlbumSearch /> {/* Album search functionality goes here */}

                    <h2>👂 Give these recent searches a try</h2>
                    <p style={{ textAlign: 'center' }}>
                        <strong>Here are some albums that people recently searched for (and probably told their friends about):</strong>
                    </p><br/>
                    <Suspense fallback={<p>Loading recent searches...</p>}>
                        <RecentSearches data={recentSearchesData} />
                    </Suspense>
                </section>
            </main>
        </div>
    );
}