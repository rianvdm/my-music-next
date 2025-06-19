// ABOUTME: Artist search form page that allows users to search for artists by name
// ABOUTME: Features a search input with Enter key support and displays random music facts while browsing
'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../../components/ui/Input';

export default function ArtistPage() {
  const [randomFact, setRandomFact] = useState('Did you know ...');
  const [searchTerm, setSearchTerm] = useState('');
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
        const response = await fetch('https://kv-fetch-random-fact.rian-db8.workers.dev/', {
          signal: fetchController.signal, // Attach the controller's signal to the fetch
        });
        const factData = await response.json();
        if (!didCancel) {
          setRandomFact(factData.data);
        }
      } catch (error) {
        if (!didCancel && error.name !== 'AbortError') {
          console.error('Error fetching random fact:', error);
          setRandomFact('Did you know? There was an error loading a random fact.');
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
    if (searchTerm.trim() !== '') {
      const formattedArtist = encodeURIComponent(
        searchTerm.trim().replace(/ /g, '-').toLowerCase()
      );
      router.push(`/artist/${formattedArtist}`);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      <header>
        <h1>👩‍🎤 Artists</h1>
      </header>
      <main>
        <div id="search-form">
          <Input
            id="artist-name"
            variant="form"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} // Listen for Enter key press
            placeholder="Enter artist name..."
          />
          <button className="button" onClick={handleSearch}>
            Search
          </button>
        </div>
        <p>{randomFact}</p>
      </main>
    </div>
  );
}
