'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateArtistSlug, generateAlbumSlug } from '../../../app/utils/slugify';

const AlbumSearch = () => {
  const [formData, setFormData] = useState({ album: '', artist: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = useCallback(e => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.split('-')[0]]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    const { album, artist } = formData;
    if (!album.trim() || !artist.trim()) {
      setError('Please enter both album and artist names.');
      return;
    }

    const formattedArtist = generateArtistSlug(artist);
    const formattedAlbum = generateAlbumSlug(album);
    router.push(`/album/${formattedArtist}_${formattedAlbum}`);
  }, [formData, router]);

  return (
    <div id="search-form">
      <input
        id="album-name"
        type="text"
        value={formData.album}
        onChange={handleChange}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Enter album name..."
      />
      <input
        id="artist-name"
        type="text"
        value={formData.artist}
        onChange={handleChange}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Enter artist name..."
      />
      <button className="button" onClick={handleSearch} style={{ width: '100px' }}>
        Search
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AlbumSearch;
