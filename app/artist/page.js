'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ArtistPage() {
    const [randomFact, setRandomFact] = useState('Loading random fact...');
    const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term
    const router = useRouter();

    useEffect(() => {
        let didCancel = false;

        async function fetchRandomFact() {
            try {
                const response = await fetch('https://api-openai-randomfact.rian-db8.workers.dev');
                const data = await response.json();
                if (!didCancel) {
                    setRandomFact(data.data);
                }
            } catch (error) {
                if (!didCancel) {
                    console.error('Error fetching random fact:', error);
                    setRandomFact('Failed to load fact.');
                }
            }
        }

        fetchRandomFact();

        return () => {
            didCancel = true;
        };
    }, []);

    const handleSearch = () => {
        if (searchTerm.trim() !== '') {
            router.push(`/artist/${encodeURIComponent(searchTerm.trim())}`);
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
                <h1>Artists</h1>
            </header>
            <main>
                <div id="search-form">
                    <input 
                        id="artist-name" 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
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