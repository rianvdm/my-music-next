'use client';

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

        fetchLovedTracks();
    }, []);

    useEffect(() => {
        lovedTracks.forEach((track) => {
            const fetchTrackData = async () => {
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

                    const spotifyQuery = `track:"${track.title}" artist:"${track.artist}"`;
                    const spotifyResponse = await fetch(`https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(spotifyQuery)}&type=track`);
                    const spotifyData = await spotifyResponse.json();

                    const spotifyUrl = spotifyData?.data?.[0]?.url || null;
                    const previewUrl = spotifyData?.data?.[0]?.preview || null;

                    setSpotifyLinks(prevLinks => ({
                        ...prevLinks,
                        [`${track.title}_${track.artist}`]: { spotifyUrl, previewUrl }
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

    const handleSearch = async () => {
        if (!album || !artist) {
            alert('Please enter both album and artist.');
            return;
        }

        setLoading(true);
        setRecommendation('');

        try {
            const response = await fetch(`https://api-openai-albumrecs.rian-db8.workers.dev/?album=${encodeURIComponent(album)}&artist=${encodeURIComponent(artist)}`);
            const data = await response.json();

            const formattedRecommendation = data.data.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            setRecommendation(formattedRecommendation);
        } catch (error) {
            console.error('Error fetching album recommendations:', error);
            setRecommendation('Failed to load recommendations. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div>
            <h1>Album Recommendations</h1>
            <div style={{ textAlign: 'center' }}>
                <strong>Looking for something fresh? Look up an album you recently enjoyed, and ChatGPT will do the rest.</strong>
            </div>
            <div id="search-form">
                <input 
                    id="album-name" 
                    type="text" 
                    value={album} 
                    onChange={(e) => setAlbum(e.target.value)} 
                    placeholder="Enter album name..." 
                    onKeyDown={handleKeyDown} 
                    className="input-field"
                />
                <input 
                    id="artist-name" 
                    type="text" 
                    value={artist} 
                    onChange={(e) => setArtist(e.target.value)} 
                    placeholder="Enter artist name..." 
                    onKeyDown={handleKeyDown} 
                    className="input-field"
                />
                <button className="button" onClick={handleSearch}>Search</button>
            </div>
            {loading && (
                <div className="track_ul">
                    <p>Loading... (No look I promise, it really <em>is</em> loading. Just count to 10. It's going to be fine.)</p>
                    <br/>
                </div>
            )}
            {recommendation && (
                <div className="track_ul">
                    <div dangerouslySetInnerHTML={{ __html: marked(recommendation) }} />
                    <br/>
                </div>
            )}
            <div style={{ marginTop: '40px' }}></div>

            <h1>Song Recommendations</h1>
            <div style={{ textAlign: 'center' }}>
                <strong>A selection of tracks I recently liked on Last.fm</strong>
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