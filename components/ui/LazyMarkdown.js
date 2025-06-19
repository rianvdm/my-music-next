// ABOUTME: Lazy-loaded markdown rendering component that dynamically imports the marked library for better performance
// ABOUTME: Processes markdown content into HTML with loading states and error fallback to plain text
'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load marked for better performance
const lazyMarked = () => import('marked').then(module => module.marked);

export default function LazyMarkdown({
  content,
  className = '',
  loadingText = 'Loading content...',
}) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function processMarkdown() {
      try {
        const marked = await lazyMarked();
        setHtml(marked(content));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error processing markdown:', error);
        setHtml(content); // Fallback to plain text
      } finally {
        setLoading(false);
      }
    }

    if (content) {
      processMarkdown();
    } else {
      setLoading(false);
    }
  }, [content]);

  if (loading) {
    return (
      <LoadingSpinner
        variant="content"
        text={loadingText}
        className={className}
        showSpinner={true}
      />
    );
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
