'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RecommendationsPage() {
    const [lovedTracks, setLovedTracks] = useState([]);
    const [trackSummaries, setTrackSummaries] = useState({});
    const [artistImages, setArtistImages] = useState({});
    const [spotifyLinks, setSpotifyLinks] = useState({});

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
            const fetchTrackData = async () => {
                try {
                    console.log(`Fetching data for track: ${track.title} by ${track.artist}`);

                    // Fetch track summary from OpenAI/KV Worker
                    const summaryResponse = await fetch(`https://api-openai-songrec.rian-db8.workers.dev/?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
                    const summaryData = await summaryResponse.json();
                    setTrackSummaries(prevSummaries => ({
                        ...prevSummaries,
                        [`${track.title}_${track.artist}`]: summaryData.data
                    }));

                    // Fetch artist details (including image) from Last.fm Worker
                    const artistDetailResponse = await fetch(`https://api-lastfm-artistdetail.rian-db8.workers.dev?artist=${encodeURIComponent(track.artist)}`);
                    const artistDetailData = await artistDetailResponse.json();
                    setArtistImages(prevImages => ({
                        ...prevImages,
                        [track.artist]: artistDetailData.image
                    }));

                    // Fetch Spotify link for the track using combined title and artist query
                    const spotifyQuery = `track:"${track.title}" artist:"${track.artist}"`;
                    const spotifyResponse = await fetch(`https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(spotifyQuery)}&type=track`);
                    const spotifyData = await spotifyResponse.json();
                    console.log(`Spotify data fetched for ${track.title} by ${track.artist}:`, spotifyData);

                    // Extract the Spotify link from the response
                    const spotifyUrl = spotifyData?.data?.[0]?.url || null;
                    console.log(`Spotify link for ${track.title} by ${track.artist}:`, spotifyUrl);

                    setSpotifyLinks(prevLinks => ({
                        ...prevLinks,
                        [`${track.title}_${track.artist}`]: spotifyUrl
                    }));
                } catch (error) {
                    console.error(`Error fetching data for ${track.title} by ${track.artist}:`, error);
                }
            };

            fetchTrackData();
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
                                {track.title}
                            </strong> by <strong>
                                <Link href={`/artist/${encodeURIComponent(track.artist)}`}>{track.artist}</Link>
                            </strong> (liked on {track.dateLiked}).
                            <p>
                                {trackSummaries[`${track.title}_${track.artist}`]
                                    ? trackSummaries[`${track.title}_${track.artist}`]
                                    : "Loading..."}
                            </p>
                            <p>
                                {spotifyLinks[`${track.title}_${track.artist}`]
                                    ? <a href={spotifyLinks[`${track.title}_${track.artist}`]} target="_blank" rel="noopener noreferrer">Spotify ↗</a>
                                    : "Loading..."}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}