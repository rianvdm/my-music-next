// ABOUTME: Album search page that allows users to search for specific albums by artist and album name
// ABOUTME: Provides search form with validation and navigation to detailed album pages with random music facts
'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateArtistSlug, generateAlbumSlug } from '../utils/slugify';
import Input from '../../components/ui/Input';

export default function AlbumSearchPage() {
  const [album, setAlbum] = useState('');
  const [artist, setArtist] = useState('');
  const [randomFact, setRandomFact] = useState('Did you know ...');
  const [error, setError] = useState('');
  const router = useRouter();
  const fetchController = useRef(null); // Controller for aborting previous fetch

  useEffect(() => {
    let didCancel = false;

    // If there is an existing fetch operation, abort it
    if (fetchController.current) {
      fetchController.current.abort();
    }

    // Create a new AbortController for this request
    fetchController.current = new AbortController();

    async function fetchRandomFact() {
      try {
        const response = await fetch('https://kv-fetch-random-fact.rian-db8.workers.dev/', {
          signal: fetchController.current.signal, // Attach the controller's signal to the fetch
        });
        const factData = await response.json();
        if (!didCancel) {
          setRandomFact(factData.data);
        }
      } catch (error) {
        if (!didCancel && error.name !== 'AbortError') {
          // eslint-disable-next-line no-console
          console.error('Error fetching random fact:', error);
          setRandomFact('Did you know? There was an error loading a random fact.');
        }
      }
    }

    fetchRandomFact();

    return () => {
      didCancel = true;
      if (fetchController.current) {
        fetchController.current.abort(); // Cleanup on unmount or rerender
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const handleSearch = () => {
    if (album.trim() === '' || artist.trim() === '') {
      setError('Please enter both album and artist names.');
      return;
    }

    setError('');

    // Generate the slugs from the user input
    const formattedArtist = generateArtistSlug(artist);
    const formattedAlbum = generateAlbumSlug(album);

    // Navigate to the album page where the search will happen
    router.push(`/album/${formattedArtist}_${formattedAlbum}`);
  };

  const handleKeyDown = e => {
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
          <Input
            id="album-name"
            variant="form"
            value={album}
            onChange={e => setAlbum(e.target.value)}
            onKeyDown={handleKeyDown} // Listen for Enter key press
            placeholder="Enter album name..."
          />
          <Input
            id="artist-name"
            variant="form"
            value={artist}
            onChange={e => setArtist(e.target.value)}
            onKeyDown={handleKeyDown} // Listen for Enter key press
            placeholder="Enter artist name..."
          />
          <button className="button" onClick={handleSearch} style={{ width: '100px' }}>
            Search
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        <p>{randomFact}</p>
      </main>
    </div>
  );
}
