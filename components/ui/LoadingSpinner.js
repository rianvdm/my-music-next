// ABOUTME: Comprehensive loading component with multiple variants (data, chart, content, etc.) and consistent styling
// ABOUTME: Supports different sizes, custom text, animated spinner icon, and context-specific loading messages
'use client';

import { memo } from 'react';
import styles from './LoadingSpinner.module.css';
const LoadingSpinner = memo(
  ({
    text,
    variant = 'default',
    size = 'medium',
    showSpinner = false,
    className = '',
    ...props
  }) => {
    // Default text based on variant
    const getDefaultText = () => {
      switch (variant) {
        case 'data':
          return 'Loading data...';
        case 'chart':
          return 'Loading chart...';
        case 'inline':
          return 'Loading...';
        case 'search':
          return 'Loading recent searches...';
        case 'collection':
          return 'Loading collection data...';
        case 'library':
          return 'Loading library data...';
        case 'recommendations':
          return 'Loading recommendations...';
        case 'content':
          return 'Loading content...';
        case 'generating':
          return 'Generating summary...';
        case 'tracks':
          return 'Loading recent tracks...';
        case 'personalities':
          return 'Loading personalities...';
        default:
          return 'Loading...';
      }
    };

    const displayText = text || getDefaultText();

    // Build className array
    const classNames = [styles.loading, styles[variant], styles[size], className]
      .filter(Boolean)
      .join(' ');

    // Use span for inline variants to avoid DOM nesting issues
    const Element = variant === 'inline' ? 'span' : 'div';

    return (
      <Element className={classNames} {...props}>
        {showSpinner && <span className={styles.spinner}>⟳</span>}
        {displayText}
      </Element>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
