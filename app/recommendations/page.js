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
    const [lastUpdatedDate, setLastUpdatedDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLovedTracks = async () => {
            try {
                const response = await fetch('https://api-lastfm-lovedtracks.rian-db8.workers.dev/');
                const data = await response.json();
                setLovedTracks(data);

                // Calculate the most recent date
                if (data && data.length > 0) {
                    // Convert date strings to Date objects
                    const dates = data.map(track => new Date(track.dateLiked));
                    // Find the most recent date
                    const mostRecentDate = new Date(Math.max(...dates));
                    // Format the date as desired
                    const formattedDate = mostRecentDate.toLocaleDateString();
                    setLastUpdatedDate(formattedDate);
                }
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
      const fetchAllTrackData = async () => {
        const summaries = {};
        const images = {};
        const links = {};

        await Promise.all(
          lovedTracks.map(async (track) => {
            try {
              // Fetch summary
              const summaryResponse = await fetch(
                `https://api-openai-artistsentence.rian-db8.workers.dev/?name=${encodeURIComponent(track.artist)}`
              );
              const summaryData = await summaryResponse.json();
              summaries[`${track.title}_${track.artist}`] = summaryData.data;

              // Fetch track data from Spotify
              const spotifyQuery = `track:${track.title} artist:${track.artist}`;
              const spotifyResponse = await fetch(
                `https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(spotifyQuery)}&type=track`
              );
              const spotifyData = await spotifyResponse.json();

              if (spotifyData?.data?.[0]) {
                const spotifyTrack = spotifyData.data[0];
                const spotifyUrl = spotifyTrack.url || null;
                const previewUrl = spotifyTrack.preview || null;
                const image = spotifyTrack.image || null;

                // Fetch Songlink data
                let songlinkUrl = null;
                if (spotifyUrl) {
                  const songlinkResponse = await fetch(
                    `https://api-songlink.rian-db8.workers.dev/?url=${encodeURIComponent(spotifyUrl)}`
                  );
                  const songlinkData = await songlinkResponse.json();
                  songlinkUrl = songlinkData.pageUrl || spotifyUrl;
                }

                links[`${track.title}_${track.artist}`] = { spotifyUrl, previewUrl, songlinkUrl };
                images[track.artist] = image;
              } else {
                console.error(`No Spotify data found for ${track.title} by ${track.artist}`);
              }
            } catch (error) {
              console.error(`Error fetching data for ${track.title} by ${track.artist}:`, error);
            }
          })
        );

        // Update states once after all data is fetched
        setTrackSummaries(summaries);
        setArtistImages(images);
        setSpotifyLinks(links);
      };

      if (lovedTracks.length > 0) {
        fetchAllTrackData();
      }
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
                <p>
                    <strong>A selection of tracks I recently liked</strong>
                    {lastUpdatedDate && (
                        <><br />Last updated on {lastUpdatedDate}</>
                    )}
                </p>
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
                                    <Link href={`/artist/${encodeURIComponent(track.artist.replace(/ /g, '-').toLowerCase())}`}>
                                        {track.artist}
                                    </Link>
                                </strong>
                                {spotifyLinks[`${track.title}_${track.artist}`]?.songlinkUrl && (
                                    <>
                                        {' '}
                                        •{' '}
                                        <a
                                            href={spotifyLinks[`${track.title}_${track.artist}`].songlinkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Listen ↗
                                        </a>
                                    </>
                                )}
                            </p>
                            <div>
                                {trackSummaries[`${track.title}_${track.artist}`] ? (
                                    <p>{trackSummaries[`${track.title}_${track.artist}`]}</p>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </div>
                            {/* Added audio player */}
                            <div>
                                {spotifyLinks[`${track.title}_${track.artist}`]?.previewUrl ? (
                                    <audio controls>
                                        <source
                                            src={spotifyLinks[`${track.title}_${track.artist}`].previewUrl}
                                            type="audio/mpeg"
                                        />
                                        Your browser does not support the audio element.
                                    </audio>
                                ) : (
                                    <p>Spotify preview not available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}