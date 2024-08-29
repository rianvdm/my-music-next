'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RecommendationsPage() {
    const [lovedTracks, setLovedTracks] = useState([]);
    const [trackSummaries, setTrackSummaries] = useState({});
    const [artistImages, setArtistImages] = useState({});

    useEffect(() => {
        const fetchLovedTracks = async () => {
            try {
                const response = await fetch('https://api-lastfm-lovedtracks.rian-db8.workers.dev/');
                const data = await response.json();
                setLovedTracks(data);
            } catch (error) {
                console.error('Error fetching loved tracks:', error);
            }
        };

        fetchLovedTracks();
    }, []);

    useEffect(() => {
        lovedTracks.forEach((track) => {
            const fetchTrackSummary = async () => {
                try {
                    const summaryResponse = await fetch(`https://api-openai-songrec.rian-db8.workers.dev/?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
                    const summaryData = await summaryResponse.json();
                    setTrackSummaries(prevSummaries => ({
                        ...prevSummaries,
                        [`${track.title}_${track.artist}`]: summaryData.data
                    }));

                    const artistDetailResponse = await fetch(`https://api-lastfm-artistdetail.rian-db8.workers.dev?artist=${encodeURIComponent(track.artist)}`);
                    const artistDetailData = await artistDetailResponse.json();
                    setArtistImages(prevImages => ({
                        ...prevImages,
                        [track.artist]: artistDetailData.image
                    }));
                } catch (error) {
                    console.error(`Error fetching data for ${track.title} by ${track.artist}:`, error);
                }
            };

            fetchTrackSummary();
        });
    }, [lovedTracks]);

    const handleImageLoad = (artist) => {
        const imageElement = document.getElementById(`artist-image-${artist}`);
        if (imageElement) {
            imageElement.classList.add('loaded');
        }
    };

    return (
        <div>
            <h1>❤️ Recommended Songs</h1>
            <p style={{ textAlign: 'center' }}>
                <strong>A selection of tracks I recently liked on Last.fm</strong> <br />
            </p>

            <div className="track_ul">
                {lovedTracks.map((track, index) => (
                    <div key={index} className="track_item">
                        <div className="artist_image_wrapper">
                            {artistImages[track.artist] ? (
                                <img
                                    id={`artist-image-${track.artist}`}
                                    src={artistImages[track.artist]}
                                    alt={track.artist}
                                    className="artist_image"
                                    onLoad={() => handleImageLoad(track.artist)}
                                />
                            ) : (
                                <div className="placeholder-image">Loading...</div>
                            )}
                        </div>
                        <div className="no-wrap-text">
                            <strong>
                                <a href={track.songUrl} target="_blank" rel="noopener noreferrer">{track.title}</a>
                            </strong> by <strong>
                                <Link href={`/artist/${encodeURIComponent(track.artist)}`}>{track.artist}</Link>
                            </strong> (liked on {track.dateLiked}).
                            <p>
                                {trackSummaries[`${track.title}_${track.artist}`]
                                    ? trackSummaries[`${track.title}_${track.artist}`]
                                    : "Loading..."} {/* Display summary or "Loading..." */}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}