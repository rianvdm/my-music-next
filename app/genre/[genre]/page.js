'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';

export default function GenrePage({ params }) {
  const { genre: prettyGenre } = params;
  const [genreSummary, setGenreSummary] = useState({
    content: 'Generating summary...',
    citations: [],
  });
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);
  const [error, setError] = useState(null);
  const fetchedGenreSummary = useRef(false);
  const timerRef = useRef(null);

  const decodePrettyUrl = prettyUrl => {
    return decodeURIComponent(prettyUrl.replace(/-/g, ' ')).replace(/\b\w/g, char =>
      char.toUpperCase()
    );
  };

  const genre = decodePrettyUrl(prettyGenre);

  // Separate effect for the timer
  useEffect(() => {
    if (genreSummary.content === 'Generating summary...') {
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
          setGenreSummary({
            content: summaryData.data.content,
            citations: summaryData.data.citations,
          });
        } catch (error) {
          console.error('Error fetching genre summary:', error);
          setGenreSummary({
            content: 'Failed to load genre summary.',
            citations: [],
          });
        }
      }

      fetchGenreSummary();
    }
  }, [genre]);

  const renderGenreSummary = summary => {
    if (summary.content === 'Generating summary...') {
      return (
        <div>
          {summary.content}
          {showExtendedMessage && (
            <span>
              {
                " It's taking a little while to make sure the robots don't say dumb things, but hang in there, it really is coming..."
              }
            </span>
          )}
        </div>
      );
    }

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
        <section className="track_ul2">{renderGenreSummary(genreSummary)}</section>
      </main>
    </div>
  );
}
