'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function GenrePage({ params }) {
  const { genre: prettyGenre } = params;
  const [genreSummary, setGenreSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedGenreSummary = useRef(false);

  const decodePrettyUrl = prettyUrl => {
    return decodeURIComponent(prettyUrl.replace(/-/g, ' ')).replace(/\b\w/g, char =>
      char.toUpperCase()
    );
  };

  const genre = decodePrettyUrl(prettyGenre);

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
          setGenreSummary({
            content: summaryData.data.content,
            citations: summaryData.data.citations,
          });
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching genre summary:', error);
          setGenreSummary({
            content: 'Failed to load genre summary.',
            citations: [],
          });
          setIsLoading(false);
        }
      }

      fetchGenreSummary();
    }
  }, [genre]);

  const renderGenreSummary = summary => {
    // Replace [n] with clickable links
    const contentWithClickableCitations = summary.content.replace(/\[(\d+)\]/g, (match, num) => {
      const index = parseInt(num) - 1;
      if (summary.citations && summary.citations[index]) {
        return `[<a href="${summary.citations[index]}" target="_blank" rel="noopener noreferrer">${num}</a>]`;
      }
      return match;
    });

    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: marked(contentWithClickableCitations) }} />
        {summary.citations && summary.citations.length > 0 && (
          <div className="citations">
            <h4>Sources</h4>
            <ul>
              {summary.citations.map((citation, index) => (
                <li key={index}>
                  <span className="citation-number">[{index + 1}]</span>{' '}
                  <a href={citation} target="_blank" rel="noopener noreferrer">
                    {new URL(citation).hostname.replace('www.', '')}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <header>
        <h1 style={{ marginBottom: 0 }}>{genre}</h1>
      </header>
      <main>
        <section className="track_ul2">
          {isLoading ? (
            <LoadingSpinner
              variant="content"
              size="medium"
              showSpinner={true}
              text="Generating summary..."
            />
          ) : (
            renderGenreSummary(genreSummary)
          )}
        </section>
      </main>
    </div>
  );
}
