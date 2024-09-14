'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { marked } from 'marked';
import Link from 'next/link';

export default function RecommendationsPage() {
    const [lovedTracks, setLovedTracks] = useState([]);
    const [trackSummaries, setTrackSummaries] = useState({});
    const [artistImages, setArtistImages] = useState({});
    const [spotifyLinks, setSpotifyLinks] = useState({});
    const [album, setAlbum] = useState('');
    const [artist, setArtist] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [newAlbumsContent, setNewAlbumsContent] = useState('');
    const [loading, setLoading] = useState(false);

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

        const fetchNewAlbumsContent = async () => {
            try {
                const response = await fetch('/content/new-albums.md');
                const markdown = await response.text();
                const htmlContent = marked(markdown);
                setNewAlbumsContent(htmlContent);
            } catch (error) {
                console.error('Error fetching new albums content:', error);
                setNewAlbumsContent('<p>Failed to load new albums content.</p>');
            }
        };

        fetchNewAlbumsContent();
        fetchLovedTracks();
    }, []);

    useEffect(() => {
        lovedTracks.forEach((track) => {
            const fetchTrackData = async () => {
                try {
                    // Fetch OpenAI summary
                    const summaryResponse = await fetch(
                        `https://api-openai-songrec.rian-db8.workers.dev/?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`
                    );
                    const summaryData = await summaryResponse.json();
                    setTrackSummaries(prevSummaries => ({
                        ...prevSummaries,
                        [`${track.title}_${track.artist}`]: summaryData.data
                    }));

                    // Fetch track data from Spotify
                    const spotifyQuery = `track:"${track.title}" artist:"${track.artist}"`;
                    const spotifyResponse = await fetch(
                        `https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(spotifyQuery)}&type=track`
                    );
                    const spotifyData = await spotifyResponse.json();

                    if (spotifyData?.data?.[0]) {
                        const spotifyTrack = spotifyData.data[0];
                        const spotifyUrl = spotifyTrack.url || null;
                        const previewUrl = spotifyTrack.preview || null;
                        const image = spotifyTrack.image || null; // Get the album image from Spotify data

                        setSpotifyLinks(prevLinks => ({
                            ...prevLinks,
                            [`${track.title}_${track.artist}`]: { spotifyUrl, previewUrl }
                        }));

                        // Set artist image using the album image from Spotify data
                        setArtistImages(prevImages => ({
                            ...prevImages,
                            [track.artist]: image
                        }));
                    } else {
                        console.error(`No Spotify data found for ${track.title} by ${track.artist}`);
                    }
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
            <h1>Recommendations</h1>
            <h2 style={{ marginBottom: 0, marginTop: "1em" }}>New Releases</h2>
            <div className="track_ul2" dangerouslySetInnerHTML={{ __html: newAlbumsContent }} />
            <h2 style={{ marginTop: "1.5em" }}>Song Recommendations</h2>
            <div style={{ textAlign: 'center' }}>
                <p><strong>A selection of tracks I recently liked on Last.fm</strong></p>
            </div>

            <div className="track_ul">
                {lovedTracks.map((track, index) => (
                    <div key={index} className="track_item track_item_responsive">
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
                            <p>
                                <strong>{track.title}</strong> by <strong>
                                <Link href={`/artist/${encodeURIComponent(track.artist.replace(/ /g, '-').toLowerCase())}`}>{track.artist}</Link>
                                </strong> (liked on {track.dateLiked}).
                            </p>
                            <div>
                                {trackSummaries[`${track.title}_${track.artist}`]
                                    ? <p>{trackSummaries[`${track.title}_${track.artist}`]}</p>
                                    : <p>Loading...</p>}
                            </div>
                            <div>
                                {spotifyLinks[`${track.title}_${track.artist}`]?.spotifyUrl ? (
                                    <p>
                                        <a href={spotifyLinks[`${track.title}_${track.artist}`]?.spotifyUrl} target="_blank" rel="noopener noreferrer">Spotify ↗</a>
                                    </p>
                                ) : <p>Loading...</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}