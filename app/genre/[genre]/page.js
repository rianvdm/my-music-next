'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';

export default function GenrePage({ params }) {
    const { genre: prettyGenre } = params;
    const [genreSummary, setGenreSummary] = useState('Generating summary...');
    const [showExtendedMessage, setShowExtendedMessage] = useState(false);
    const [error, setError] = useState(null);
    const fetchedGenreSummary = useRef(false);
    const timerRef = useRef(null);

    const decodePrettyUrl = (prettyUrl) => {
        return decodeURIComponent(prettyUrl.replace(/-/g, ' '))
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const genre = decodePrettyUrl(prettyGenre);

    // Separate effect for the timer
    useEffect(() => {
        if (genreSummary === 'Generating summary...') {
            timerRef.current = setTimeout(() => {
                setShowExtendedMessage(true);
            }, 2000);

            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            };
        }
    }, [genreSummary]);

    // Effect for fetching data
    useEffect(() => {
        if (genre && !fetchedGenreSummary.current) {
            fetchedGenreSummary.current = true;

            async function fetchGenreSummary() {
                try {
                    const encodedGenre = encodeURIComponent(genre);
                    const summaryResponse = await fetch(
                        `https://api-perplexity-genresummary.rian-db8.workers.dev?genre=${encodedGenre}`
                    );
                    const summaryData = await summaryResponse.json();
                    setGenreSummary(summaryData.data);
                } catch (error) {
                    console.error('Error fetching genre summary:', error);
                    setGenreSummary('Failed to load genre summary.');
                }
            }
            
            fetchGenreSummary();
        }
    }, [genre]);

    const renderGenreSummary = (summary) => {
        if (summary === 'Generating summary...') {
            return (
                <div>
                    {summary}
                    {showExtendedMessage && (
                        <span>
                            {" It's taking a little while to make sure the robots don't say dumb things, but hang in there, it really is coming..."}
                        </span>
                    )}
                </div>
            );
        }
        return <div dangerouslySetInnerHTML={{ __html: marked(summary) }} />;
    };

    return (
        <div>
            <header>
                <h1 style={{ marginBottom: 0 }}>{genre}</h1>
            </header>
            <main>
                <section className="track_ul2">
                    {renderGenreSummary(genreSummary)}
                </section>
            </main>
        </div>
    );
}