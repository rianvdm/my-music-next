// ABOUTME: Displays a grid of recently searched albums with cover art and links
// ABOUTME: Shows loading state and handles empty state, linking to album and artist pages
'use client';

import { memo } from 'react';
import Link from 'next/link';
import { generateArtistSlug, generateAlbumSlug } from '../../../app/utils/slugify';
import LoadingSpinner from '../../ui/LoadingSpinner';

const RecentSearches = memo(({ searches, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner variant="search" showSpinner={true} />;
  }
  if (!searches?.length) {
    return null;
  }

  return (
    <div className="track-grid">
      {searches.map(album => {
        const artistSlug = generateArtistSlug(album.artist);
        const albumSlug = generateAlbumSlug(album.name);

        return (
          <div className="track" key={album.id}>
            <Link href={`/album/${artistSlug}_${albumSlug}`}>
              <img src={album.image} className="track_image" alt={album.name} />
            </Link>
            <div className="track_content">
              <p className="track_name">
                <Link href={`/album/${artistSlug}_${albumSlug}`}>
                  <strong>{album.name}</strong>
                </Link>
              </p>
              <p className="track_artist">
                <Link href={`artist/${artistSlug}`}>{album.artist}</Link>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

RecentSearches.displayName = 'RecentSearches';

export default RecentSearches;
