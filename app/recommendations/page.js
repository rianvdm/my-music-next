'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { marked } from 'marked';
import Link from 'next/link';
import LazyImage from '../components/LazyImage'; 

export default function RecommendationsPage() {
    const [lovedTracks, setLovedTracks] = useState([]);
    const [trackSummaries, setTrackSummaries] = useState({});
    const [artistImages, setArtistImages] = useState({});
    const [spotifyLinks, setSpotifyLinks] = useState({});
    const [newAlbumsContent, setNewAlbumsContent] = useState('');
    const [lastUpdatedDate, setLastUpdatedDate] = useState('');

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
                    // Format the date as "month day, year"
                    const formattedDate = mostRecentDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
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
        lovedTracks.forEach(async (track) => {
          const trackKey = `${track.title}_${track.artist}`;
          try {
            // Fetch Summary
            const summaryResponse = await fetch(`https://api-openai-artistsentence.rian-db8.workers.dev/?name=${encodeURIComponent(track.artist)}`);
            const summaryData = await summaryResponse.json();
            setTrackSummaries(prev => ({ ...prev, [trackKey]: summaryData.data }));

            // Fetch Spotify Data
            const spotifyResponse = await fetch(`https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(`track:${track.title} artist:${track.artist}`)}&type=track`);
            const spotifyData = await spotifyResponse.json();

            if (spotifyData?.data?.[0]) {
              const spotifyTrack = spotifyData.data[0];
              const spotifyUrl = spotifyTrack.url || null;
              const previewUrl = spotifyTrack.preview || null;
              const image = spotifyTrack.image || null;

              setArtistImages(prev => ({ ...prev, [track.artist]: image }));

              // Fetch Songlink Data
              let songlinkUrl = null;
              if (spotifyUrl) {
                const songlinkResponse = await fetch(`https://api-songlink.rian-db8.workers.dev/?url=${encodeURIComponent(spotifyUrl)}`);
                const songlinkData = await songlinkResponse.json();
                songlinkUrl = songlinkData.pageUrl || spotifyUrl;
              }

              setSpotifyLinks(prev => ({
                ...prev,
                [trackKey]: { spotifyUrl, previewUrl, songlinkUrl }
              }));
            } else {
              console.error(`No Spotify data found for ${track.title} by ${track.artist}`);
            }
          } catch (error) {
            console.error(`Error fetching data for ${track.title} by ${track.artist}:`, error);
          }
        });
      };

      if (lovedTracks.length > 0) {
        fetchAllTrackData();
      }
    }, [lovedTracks]);

    return (
        <div>
{/*             <h1>Recommendations</h1>
            <h1 style={{ marginBottom: 0, marginTop: "1em" }}>New Releases</h1>
            <div className="track_ul2" dangerouslySetInnerHTML={{ __html: newAlbumsContent }} /> */}
            <h1 style={{ marginTop: "0.5em" }}>Song Recommendations</h1> 
            <div style={{ textAlign: 'center' }}>
                <p>
                    <strong>A selection of tracks I recently liked</strong>
                    {lastUpdatedDate && (
                        <><br />Last updated on {lastUpdatedDate}<br/><br/></>
                    )}
                </p>
            </div>
            <div className="track_ul">
                {lovedTracks.map((track, index) => (
                    <div key={index} className="track_item track_item_responsive">
                        <div className="artist_image_wrapper">
                            {artistImages[track.artist] ? (
                                <LazyImage
                                    src={artistImages[track.artist]}
                                    alt={track.artist}
                                    width={150}
                                    height={150}
                                />
                            ) : (
                                <div className="placeholder-image">Loading...</div>
                            )}
                        </div>
                        <div className="no-wrap-text">
                            <p>
                                <strong>{track.title}</strong> by{' '}
                                <Link href={`/artist/${encodeURIComponent(track.artist.replace(/ /g, '-').toLowerCase())}`}>
                                    {track.artist}
                                </Link>
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
