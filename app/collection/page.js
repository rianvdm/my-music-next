'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CollectionPage() {
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        const fetchRecentAlbums = async () => {
            try {
                const response = await fetch('https://api-discogs-collection.rian-db8.workers.dev/');
                const data = await response.json();
                setAlbums(data.slice(0, 9)); // Limit to the first 9 releases
            } catch (error) {
                console.error('Error fetching recent albums:', error);
            }
        };

        fetchRecentAlbums();
    }, []);

    return (
        <div>
            <h1>💿 Recent additions</h1>
            <p style={{ textAlign: 'center' }}>
                <strong>The last few albums I added to my physical collection.</strong>
            </p>

            <div className="track-grid">
                {albums.map((release) => (
                    <div className="track" key={release.discogsUrl}>
                        <a href={release.discogsUrl} target="_blank" rel="noopener noreferrer">
                            <img src={release.imageUrl} className="track_image" alt={release.title} style={imageStyle} />
                        </a>
                        <div className="track_content">
                            <h2 className="track_artist">
                                <a href={release.discogsUrl} target="_blank" rel="noopener noreferrer">
                                    {release.title}
                                </a>
                            </h2>
                            <p className="track_name">
                                    {release.artist}
                            </p>
                            <p className="track_album">{release.format} added on {new Date(release.addedDate).toLocaleDateString()}.</p>
                            <p className="track_album">{release.genre} album on the {release.label} label, {release.year ? `released in ${release.year}.` : `unknown release date.`}</p>
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ textAlign: 'center', marginTop: '3em' }}>
                <a href="https://www.discogs.com/user/elezea-records/collection" target="_blank" rel="noopener noreferrer">
                    <strong>View full collection on Discogs ↗</strong>
                </a>
            </p>
        </div>
    );
}

const imageStyle = {
    width: '220px',       // Set a fixed width
    height: '220px',      // Set a fixed height to make the image square
    objectFit: 'cover',   // Scale the image to cover the area
    borderRadius: '5px', 
};