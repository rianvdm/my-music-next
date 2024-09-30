'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';

export default function GenrePage({ params }) {
    const { genre: prettyGenre } = params;
    const [genreSummary, setGenreSummary] = useState('Generating summary...');
    const [error, setError] = useState(null);
    const fetchedGenreSummary = useRef(false);

const decodePrettyUrl = (prettyUrl) => {
    return decodeURIComponent(prettyUrl.replace(/-/g, ' '))
        .replace(/\b\w/g, char => char.toUpperCase());
};

    const genre = decodePrettyUrl(prettyGenre);

    // Fetch OpenAI genre summary
    useEffect(() => {
        if (genre && !fetchedGenreSummary.current) {
            fetchedGenreSummary.current = true;

            async function fetchGenreSummary() {
                try {
                    const encodedGenre = encodeURIComponent(genre);

                    const summaryResponse = await fetch(
                    //    `https://api-openai-genresummary.rian-db8.workers.dev?genre=${encodedGenre}`
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

    if (error) {
        return <p>{error}</p>;
    }

    const renderGenreSummary = (summary) => {
        return <div dangerouslySetInnerHTML={{ __html: marked(summary) }} />;
    };

    return (
        <div>
            <header>
                <h1>{genre}</h1>
            </header>
            <main>
                <section className="track_ul2">
                    {renderGenreSummary(genreSummary)}
                </section>
            </main>
        </div>
    );
}