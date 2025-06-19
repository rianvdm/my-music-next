// ABOUTME: Error boundary component that catches JavaScript errors anywhere in the child component tree
// ABOUTME: Displays a fallback UI instead of the component tree that crashed, improving user experience during errors
'use client';

import React from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service or console
    // eslint-disable-next-line no-console
    console.error('Error caught by boundary:', error, errorInfo);

    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Optional: Log to external error tracking service
    // Example: errorTrackingService.log(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI - can be customized via props
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default fallback UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <h2>Something went wrong</h2>
            <p>
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page or
              contact support if the problem persists.
            </p>
            <div className={styles.errorActions}>
              <button onClick={this.handleReset} className={styles.retryButton}>
                Try Again
              </button>
              <button onClick={() => window.location.reload()} className={styles.refreshButton}>
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development Only)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
