'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AlbumSearchPage() {
    const [album, setAlbum] = useState('');
    const [artist, setArtist] = useState('');
    const [randomFact, setRandomFact] = useState('Did you know ...');
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

    const handleSearch = () => {
        if (album.trim() !== '' && artist.trim() !== '') {
            const formattedArtist = encodeURIComponent(artist.trim().replace(/ /g, '-').toLowerCase());
            const formattedAlbum = encodeURIComponent(album.trim().replace(/ /g, '-').toLowerCase());
            router.push(`/album/${formattedArtist}_${formattedAlbum}`);
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
                    <button className="button" onClick={handleSearch}>Search</button>
                </div>
                <p>{randomFact}</p>
            </main>
        </div>
    );
}