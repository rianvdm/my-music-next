// ABOUTME: Page-level error boundary component specifically designed for wrapping entire pages and page sections
// ABOUTME: Provides a more comprehensive fallback UI with navigation options when page-level errors occur
'use client';

import React from 'react';
import Link from 'next/link';
import ErrorBoundary from './ErrorBoundary';
import styles from './PageErrorBoundary.module.css';

const PageErrorBoundary = ({ children, pageName }) => {
  const pageErrorFallback = (error, resetError) => (
    <div className={styles.pageErrorBoundary}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>⚠️</div>
        <h1>Oops! Something went wrong</h1>
        <p>
          We encountered an error while loading {pageName ? `the ${pageName} page` : 'this page'}.
          This is usually temporary and can be resolved by trying again.
        </p>

        <div className={styles.errorActions}>
          <button onClick={resetError} className={styles.primaryButton}>
            Try Again
          </button>
          <button onClick={() => window.location.reload()} className={styles.secondaryButton}>
            Refresh Page
          </button>
        </div>

        <div className={styles.navigationLinks}>
          <p>Or navigate to:</p>
          <div className={styles.linkGrid}>
            <Link href="/" className={styles.navLink}>
              🏠 Home
            </Link>
            <Link href="/album" className={styles.navLink}>
              🎵 Search Albums
            </Link>
            <Link href="/artist" className={styles.navLink}>
              🎤 Search Artists
            </Link>
            <Link href="/collection" className={styles.navLink}>
              📀 Collection
            </Link>
            <Link href="/library" className={styles.navLink}>
              📚 Library
            </Link>
            <Link href="/mystats" className={styles.navLink}>
              📊 My Stats
            </Link>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className={styles.errorDetails}>
            <summary>Technical Details (Development Mode)</summary>
            <div className={styles.errorInfo}>
              <strong>Error:</strong> {error?.message || 'Unknown error'}
              <br />
              <strong>Page:</strong> {pageName || 'Unknown page'}
              <br />
              <strong>Time:</strong> {new Date().toLocaleString()}
            </div>
          </details>
        )}
      </div>
    </div>
  );

  return <ErrorBoundary fallback={pageErrorFallback}>{children}</ErrorBoundary>;
};

export default PageErrorBoundary;
