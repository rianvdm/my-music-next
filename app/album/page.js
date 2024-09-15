'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AlbumSearchPage() {
    const [album, setAlbum] = useState('');
    const [artist, setArtist] = useState('');
    const [randomFact, setRandomFact] = useState('Did you know ...');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    let fetchController = null; // Controller for aborting previous fetch

    useEffect(() => {
        let didCancel = false;

        // If there is an existing fetch operation, abort it
        if (fetchController) {
            fetchController.abort();
        }

        // Create a new AbortController for this request
        fetchController = new AbortController();

        async function fetchRandomFact() {
            try {
                const response = await fetch('https://api-openai-randomfact.rian-db8.workers.dev', {
                    signal: fetchController.signal, // Attach the controller's signal to the fetch
                });
                const data = await response.json();
                if (!didCancel) {
                    setRandomFact(data.data);
                }
            } catch (error) {
                if (!didCancel && error.name !== 'AbortError') {
                    console.error('Error fetching random fact:', error);
                    setRandomFact('Failed to load fact.');
                }
            }
        }

        fetchRandomFact();

        return () => {
            didCancel = true;
            if (fetchController) {
                fetchController.abort(); // Cleanup on unmount or rerender
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once

    const handleSearch = async () => {
        if (album.trim() === '' || artist.trim() === '') {
            setError('Please enter both album and artist names.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Perform Spotify search
            const query = `album: "${album}" artist:"${artist}"`;
            const spotifyResponse = await fetch(
                `https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(query)}&type=album`
            );
            const spotifyData = await spotifyResponse.json();

            if (spotifyData.data && spotifyData.data.length > 0) {
                // Use the first result to get the correct album and artist names
                const spotifyAlbum = spotifyData.data[0];
                const formattedArtist = encodeURIComponent(spotifyAlbum.artist.replace(/ /g, '-').toLowerCase());
                const formattedAlbum = spotifyAlbum.name
                    .replace(/\s*\(.*?\)\s*/g, '') // Remove any text inside parentheses
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .toLowerCase();

                // Push the user to the correct URL
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
        <div>
            <header>
                <h1>💿 Album Search</h1>
            </header>
            <main>
                <div id="search-form">
                    <input
                        id="album-name"
                        type="text"
                        value={album}
                        onChange={(e) => setAlbum(e.target.value)}
                        onKeyDown={handleKeyDown} // Listen for Enter key press
                        placeholder="Enter album name..."
                    />
                    <input
                        id="artist-name"
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        onKeyDown={handleKeyDown} // Listen for Enter key press
                        placeholder="Enter artist name..."
                    />
                    <button className="button" onClick={handleSearch} disabled={loading} style={{ width: '100px' }}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
                <p>{randomFact}</p>
            </main>
        </div>
    );
}